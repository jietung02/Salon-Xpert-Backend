const { connection } = require('../config/dbConnection');
const { createNewEventinStaffCalendar, getEvents, getSpecialistEvents, checkAvailability, } = require('./calendarService');
const { convertServicesFormat } = require('../utils/responseFormatter');
const { hashPassword } = require('./authService');
const crypto = require('crypto');
const moment = require('moment');

const getAllServices = async () => {
    try {
        const sql = "SELECT * FROM SERVICE";

        const [serviceResult] = await connection.execute(sql);

        if (serviceResult.length === 0) {
            return;
        }
        const services = await convertServicesFormat(serviceResult);
        return services;

    } catch (err) {
        throw new Error(err.message);
    }
}



const getMatchSpecialists = async (selectedServices) => {
    try {
        //         SELECT s.STAFF_ID, s.STAFF_FULL_NAME
        // FROM STAFF s
        // JOIN STAFFSPECIALTY ss ON s.STAFF_ID = ss.STAFF_ID
        // WHERE ss.SERVICE_CODE IN ('BEARD_GROOM', 'HAIR_COLOR')
        // GROUP BY s.STAFF_ID, s.STAFF_FULL_NAME
        // HAVING COUNT(DISTINCT ss.SERVICE_CODE) = 2;
        const placeholders = selectedServices.map(() => '?').join(', ');

        const sql = `SELECT s.STAFF_ID, s.STAFF_FULL_NAME FROM STAFF s JOIN STAFFSPECIALTY ss ON s.STAFF_ID = ss.STAFF_ID WHERE ss.SERVICE_CODE IN (${placeholders}) GROUP BY s.STAFF_ID, s.STAFF_FULL_NAME HAVING COUNT(DISTINCT ss.SERVICE_CODE) = ?`;

        const params = [...selectedServices, selectedServices.length];
        const [specialistsResult] = await connection.execute(sql, params);

        if (specialistsResult.length === 0) {
            return;
        }
        const specialists = await convertSpecialistsFormat(specialistsResult);
        return specialists;

    } catch (err) {
        throw new Error(err.message);
    }
}

const convertSpecialistsFormat = async (specialists) => {
    try {
        return specialists.map(({ STAFF_ID: staffId, STAFF_FULL_NAME: staffName }) => {
            return {
                staffId,
                staffName,
            }
        });
    } catch (err) {
        throw new Error('Failed to Convert Specialists Format');
    }

}

const getEstimatedPrice = async (appointDetails, totalBasedPrice) => {
    try {
        const { name, email, gender, age, contact, selectedServices, selectedSpecialist, selectedDate, selectedTime, from, username } = appointDetails;

        //GET PRICE OPTIONS WHERE IS SELECTED = 1
        const sql = "SELECT PRICEOPTION_CODE AS priceOptionCode FROM PRICEOPTION WHERE PRICEOPTION_ACTIVE = 1";
        const [priceOptionsResult] = await connection.execute(sql);

        if (priceOptionsResult.length === 0) {
            return null;
        }


        const priceOptionCodes = priceOptionsResult.map(value => value.priceOptionCode);

        const placeholders = priceOptionCodes.map(() => '?').join(', ');
        const placeholders2 = selectedServices.map(() => '?').join(', ');
        const sql2 = `SELECT SERVICE_CODE AS serviceCode, PRICEOPTION_CODE AS priceOptionCode, PRICERULE_OPTION_VALUE AS priceOptionValue, PRICERULE_PRICE_ADJUSTMENT AS priceAdjustment FROM PRICERULE WHERE PRICEOPTION_CODE IN (${placeholders}) && SERVICE_CODE IN (${placeholders2})`;
        console.log(sql2)
        const params = [...priceOptionCodes, ...selectedServices];
        console.log(params)
        const [pricingRulesResult] = await connection.execute(sql2, params);
        console.log(pricingRulesResult);

        console.log(selectedSpecialist)
        const totalEstimatedPrice = pricingRulesResult.reduce((accum, curr) => {
            console.log(accum)
            const { serviceCode, priceOptionCode, priceOptionValue, priceAdjustment } = curr;

            if (priceOptionCode === 'AGE') {
                const [fromAge, toAge] = priceOptionValue.split('-');

                if (parseInt(fromAge) <= age && age <= parseInt(toAge)) {
                    return parseFloat(accum) + parseFloat(priceAdjustment);
                }
            }
            else if (priceOptionCode === 'GENDER') {
                if (priceOptionValue === gender) {
                    return parseFloat(accum) + parseFloat(priceAdjustment);
                }
            }

            else if (priceOptionCode === 'SPECIALIST') {
                if (priceOptionValue === selectedSpecialist) {
                    return parseFloat(accum) + parseFloat(priceAdjustment);
                }
            }
            return accum;
        }, totalBasedPrice);
        console.log(totalEstimatedPrice)

        return totalEstimatedPrice;

    } catch (err) {
        throw new Error(err.message);
    }


}

const createNewAppointment = async (appointDetails) => {
    try {
        const { name, email, gender, age, contact, selectedServices, bookingmethod, selectedSpecialist, selectedDate, selectedTime, from, username } = appointDetails;


        //GET STAFF NAME AND CALENDAR ID 
        const sql = "SELECT STAFF_FULL_NAME AS staffName, STAFF_CALENDAR_ID AS calendarId FROM STAFF WHERE STAFF_ID = ?";

        const [staffNameCalendarIdResult] = await connection.execute(sql, [selectedSpecialist]);
        if (staffNameCalendarIdResult.length === 0) {
            throw new Error('No Specialist Name and Calendar ID Found');
        }
        const [{ staffName, calendarId }] = staffNameCalendarIdResult;

        //GET SUM SERVICE DURATION AND SERVICE BASED PRICE
        const placeholders = selectedServices.map(() => '?').join(', ');
        const sql2 = `SELECT SUM(SERVICE_DURATION) AS totalDuration, SUM(SERVICE_BASED_PRICE) AS totalPrice FROM SERVICE WHERE SERVICE_CODE IN (${placeholders})`;

        const [durationPriceResult] = await connection.execute(sql2, selectedServices);

        if (durationPriceResult.length === 0) {
            throw new Error('Failed to Retrieve Total Service Duration and Price')
        }

        const [{ totalDuration, totalPrice }] = durationPriceResult;
        //GET SERVICES NAME
        const serviceplaceholders = selectedServices.map(() => '?').join(', ');
        const sql3 = `SELECT SERVICE_NAME AS serviceName FROM SERVICE WHERE SERVICE_CODE IN (${serviceplaceholders})`;

        const [servicesWithName] = await connection.execute(sql3, selectedServices);

        if (servicesWithName.length === 0) {
            throw new Error('Service Names Not Found');
        }
        const servicesNameString = servicesWithName.map(value => value.serviceName).join(', ');


        //GET ESTIMATED PRICE (hardcode now will change here in the future)
        const estimatedPrice = await getEstimatedPrice(appointDetails, totalPrice);

        //GET DEPOSIT PRICE
        const depositAmount = Math.floor(parseFloat(estimatedPrice !== null ? estimatedPrice : totalPrice) * 0.1).toFixed(2);


        //START HERE RECALL THE CHECK OVERLAP FUNCTION TO SEE IF THE SELECTED TIMESLOT STILL AVAILABLE, ELSE THROW NEW ERROR
        const availableTimeSlots = await fetchSpecialistAvailableTimeSlots({ selectedServices, selectedSpecialist, selectedDate });
        // console.log(availableTimeSlots);

        const appointmentDateTime = new Date(selectedTime);
        const hour = appointmentDateTime.getHours();
        const minute = appointmentDateTime.getMinutes();

        const available = availableTimeSlots.filter((value) => {
            return value.hour === hour && value.minutes.includes(minute);
        });

        if (available.length === 0) {
            return {
                status: 'error',
                message: 'Selected Timeslot is Not Available',
                data: null,
            }
        }

        console.log(available)

        //CALCULATE APPOINTMENT END TIME
        const appointmentEndDateTime = new Date(appointmentDateTime.getTime() + parseInt(totalDuration) * 60000);
        const currentDateTime = new Date();
        //GENERATE RANDOM APPOINTMENT ID
        const appointmentId = crypto.randomBytes(16).toString('hex');

        //UPDATE TO APPOINTMENT DATABASE (RMB TO HARD CODE THE ESTIMATED PRICE FIRST SINCE IT IS IMPLEMENTED YET)
        //STORE THE APPOINTMENT ID TO APPOINTMENT TABLE (SIMPLYING APPOINTMENT CANCELATION PROCESS)
        let sql4;

        //BEGIN TRANSACTION
        await connection.query('START TRANSACTION');

        //GET CUSTOMER ID OR INSERT TO GUEST TABLE
        let id = null;

        if (username !== null && from === 'customer') {
            const sql0 = "SELECT CUSTOMER_ID as custId FROM CUSTOMER INNER JOIN USER ON CUSTOMER.USER_ID = USER.USER_ID WHERE USER_USERNAME = ?";
            const [userIdResult] = await connection.execute(sql0, [username]);

            const [{ custId }] = userIdResult;
            if (custId === null) {
                throw new Error('Failed to Fetch Customer ID');
            }
            id = custId;
        }
        else if (username === null && from === 'guest') {

            let userId = null;
            //CHECK EMAIL EXIST IN USER TABLE
            const sqlEmailExists = "SELECT COUNT(*) as isExists FROM USER WHERE USER_USERNAME = ?";
            const [guestUserExists] = await connection.execute(sqlEmailExists, [email]);
            const [{ isExists }] = guestUserExists;
            console.log(isExists)

            if (isExists === 0) {
                //INSERT INTO USER TABLE

                const hashedPassword = await hashPassword(name);
                const sqlInsertUser = "INSERT INTO USER (USER_USERNAME, USER_PASSWORD_HASH, USER_EMAIL, USER_ROLE) VALUES (?, ?, ?, ?)";
                const [guestUserInsertResult] = await connection.execute(sqlInsertUser, [email, hashedPassword, email, 'guest']);
                const rowAffectedGuestUser = guestUserInsertResult.affectedRows;

                if (rowAffectedGuestUser <= 0) {
                    throw new Error('Failed to Insert into User Table (Guest)');
                }
                userId = guestUserInsertResult.insertId;
            } else {
                const sqlUserId = "SELECT USER_ID as userId FROM USER WHERE USER_USERNAME = ?";
                const [guestUserIdResult] = await connection.execute(sqlUserId, [email]);
                [{ userId }] = guestUserIdResult;
                userId = userId;
                console.log(userId)
            }

            const sqlInsertGuest = "INSERT INTO GUEST (USER_ID, GUEST_FULL_NAME, GUEST_GENDER, GUEST_AGE, GUEST_CONTACT_NUMBER) VALUES (?, ?, ?, ?, ?)";
            const [guestInsertResult] = await connection.execute(sqlInsertGuest, [userId, name, gender, age, contact]);
            const rowAffectedGuest = guestInsertResult.affectedRows;

            if (rowAffectedGuest <= 0) {
                throw new Error('Failed to Insert into Guest Table');
            }
            id = guestInsertResult.insertId;

        }


        if (from === 'customer') {
            sql4 = "INSERT INTO APPOINTMENT (APPOINTMENT_ID, CUSTOMER_ID, STAFF_ID, APPOINTMENT_START_DATE_TIME, APPOINTMENT_END_DATE_TIME, APPOINTMENT_CREATED_DATE, APPOINTMENT_DEPOSIT_AMOUNT, APPOINTMENT_ESTIMATED_PRICE, APPOINTMENT_STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        }
        else if (from === 'guest') {
            sql4 = "INSERT INTO APPOINTMENT (APPOINTMENT_ID, GUEST_ID, STAFF_ID, APPOINTMENT_START_DATE_TIME, APPOINTMENT_END_DATE_TIME, APPOINTMENT_CREATED_DATE, APPOINTMENT_DEPOSIT_AMOUNT, APPOINTMENT_ESTIMATED_PRICE, APPOINTMENT_STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        }

        else {
            throw new Error('No specified Booking from which user');
        }

        const value = [appointmentId, id, selectedSpecialist, moment(appointmentDateTime).format('YYYY-MM-DD HH:mm:ss'), moment(appointmentEndDateTime).format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), parseFloat(depositAmount), parseFloat(estimatedPrice), 'PendingDeposit'];
        const [result] = await connection.execute(sql4, value);
        const rowAffected = result.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Insert to Appointment Table')
        }

        //UPDATE TO APPOINTMENTSERVICE
        for (const serviceCode of appointDetails.selectedServices) {
            const sql5 = "INSERT INTO APPOINTMENTSERVICE (APPOINTMENT_ID, SERVICE_CODE) VALUES (?, ?)";

            const [appointmentServiceResult] = await connection.execute(sql5, [appointmentId, serviceCode]);
            const rowAffected2 = appointmentServiceResult.affectedRows;

            if (rowAffected2 <= 0) {
                throw new Error('Failed to Insert into Appointment Service Table');
            }
        }

        await connection.query('COMMIT');

        return {
            status: 'success',
            message: 'Appointment Added, Pending Deposit',
            data: {
                appointmentId: appointmentId,
                name: name,
                email: email,
                servicesName: servicesNameString,
                specialist: staffName,
                startDateTime: moment(appointmentDateTime).format('YYYY-MM-DD HH:mm'),
                endDateTime: moment(appointmentEndDateTime).format('YYYY-MM-DD HH:mm'),
                estimatedPrice: estimatedPrice !== null ? estimatedPrice : totalPrice,
                depositAmount: depositAmount,
                from: from,
            },
        };

    } catch (err) {
        await connection.query('ROLLBACK');
        throw new Error(err.message);
    }
}

const handleDeposit = async (summaryDetails) => {
    try {
        //ASSUME DEPOSIT HAS BEEN PAID

        //FETCH APPOINTMENT DETAILS
        const sql = "SELECT A.STAFF_ID AS selectedSpecialist, ASer.SERVICE_CODE AS selectedService, A.APPOINTMENT_START_DATE_TIME AS selectedTime FROM APPOINTMENT A INNER JOIN APPOINTMENTSERVICE AS ASer ON A.APPOINTMENT_ID = ASer.APPOINTMENT_ID WHERE A.APPOINTMENT_ID = ?"
        const [result] = await connection.execute(sql, [summaryDetails.appointmentId]);

        if (result.length === 0) {
            throw new Error('No Appointment Details Found')
        }
        console.log('inn')
        //REFORMAT APPOINTMENT DETAILS TO BE USED IN TIME SLOT AVAILABILITY CHECK;
        const appointmentDetails = result.reduce((prev, value) => {
            if (!prev.selectedServices) {
                return {
                    selectedSpecialist: value.selectedSpecialist,
                    selectedServices: [value.selectedService],
                    selectedTime: value.selectedTime,
                }
            }

            return {
                selectedSpecialist: value.selectedSpecialist,
                selectedServices: [...prev.selectedServices, value.selectedService],
                selectedTime: value.selectedTime,
            }

        }, {})

        //ADD SELECTED DATE
        const appointmentDetailsWithDateOnly = {
            ...appointmentDetails,
            selectedDate: appointmentDetails.selectedTime.toISOString().split('T')[0],
        }

        //GET STAFF CALENDAR ID
        const sql2 = "SELECT STAFF_CALENDAR_ID AS calendarId FROM STAFF WHERE STAFF_ID = ?";

        const [calendarIdResult] = await connection.execute(sql2, [appointmentDetailsWithDateOnly.selectedSpecialist]);

        if (calendarIdResult.length === 0) {
            throw new Error('No Calendar ID Found');
        }
        const [{ calendarId }] = calendarIdResult;

        //CHECK AVAILABILITY
        const availableTimeSlots = await fetchSpecialistAvailableTimeSlots({ ...appointmentDetailsWithDateOnly });
        // console.log(availableTimeSlots);

        const appointmentDateTime = new Date(appointmentDetailsWithDateOnly.selectedTime);

        const hour = appointmentDateTime.getHours();
        const minute = appointmentDateTime.getMinutes();

        const available = availableTimeSlots.filter((value) => {
            return value.hour === hour && value.minutes.includes(minute);
        });

        if (available.length === 0) {
            return {
                status: 'error',
                message: 'Selected Timeslot is Not Available',
                data: null,
            }
        }

        console.log(available)

        //CREATE NEW EVENT
        await createNewEventinStaffCalendar({ calendarId, ...summaryDetails });


        //UPDATE APPOINTMENT STATUS TO SCHEDULED
        await updateAppointmentStatusToScheduled(summaryDetails.appointmentId);

        return {
            status: 'success',
            message: 'Deposit Paid Successfully, and Appointment Created',
            data: {
                appointmentId: summaryDetails.appointmentId,
                servicesName: summaryDetails.servicesName,
                name: summaryDetails.name,
                email: summaryDetails.email,
                specialist: summaryDetails.specialist,
                estimatedPrice: summaryDetails.estimatedPrice,
                startDateTime: summaryDetails.startDateTime,
                endDateTime: summaryDetails.endDateTime,
                depositPaid: summaryDetails.depositAmount,
                from: summaryDetails.from,
            }
        };

    } catch (err) {
        throw new Error(err.message);
    }
}

const updateAppointmentStatusToScheduled = async (appointmentId) => {
    try {
        console.log(appointmentId)
        const sql = "UPDATE APPOINTMENT SET APPOINTMENT_STATUS = 'Scheduled' WHERE APPOINTMENT_ID = ?";

        const [result] = await connection.execute(sql, [appointmentId]);
        const rowAffected = result.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Update Appointment Status to Scheduled');
        }

        return;
    } catch (err) {
        throw new Error(err.message);
    }
}

const checkTimeAvailability = async (events, startDateTime, endDateTime) => {
    if (events.length === 0) {
        return true;
    }
    console.log(events)

}

const fetchSpecialistAvailableTimeSlots = async (queryData) => {
    try {

        const { selectedServices, selectedSpecialist, selectedDate } = queryData;

        //GET STAFF CALENDAR ID
        const sql = "SELECT STAFF_CALENDAR_ID AS calendarId FROM STAFF WHERE STAFF_ID = ?";

        const [calendarIdResult] = await connection.execute(sql, [selectedSpecialist]);

        if (calendarIdResult.length === 0) {
            throw new Error('No Calendar ID Found');
        }
        const [{ calendarId }] = calendarIdResult;

        //GET TOTAL SERVICE DURATION
        const placeholders = selectedServices.map(() => '?').join(', ');
        const sql2 = `SELECT SUM(SERVICE_DURATION) AS totalDuration FROM SERVICE WHERE SERVICE_CODE IN (${placeholders})`;

        const [durationResult] = await connection.execute(sql2, selectedServices);

        if (durationResult.length === 0) {
            throw new Error('Total Service Duration Not Found');
        }
        const [{ totalDuration }] = durationResult;


        //FETCH THE SPECIFIC STAFF THE SELECTED DATE EVENTS
        const events = await getSpecialistEvents(calendarId, selectedDate)
        const openHour = parseInt(process.env.WORKING_HOUR);
        const closeHour = parseInt(process.env.CLOSING_HOUR);

        const allTimeSlots = [];
        const occupiedTimeSlots = [];

        for (let hour = openHour; hour < closeHour; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                allTimeSlots.push({ hour, minute });
            }
        }
        // console.log(allTimeSlots)

        events.forEach((event) => {
            const { start: { dateTime: startDateTime }, end: { dateTime: endDateTime } } = event;
            const eventStartTime = new Date(startDateTime);
            const eventEndTime = new Date(endDateTime);

            for (let time = eventStartTime; time < eventEndTime; time.setMinutes(time.getMinutes() + 15)) {
                const hour = time.getHours();
                const minute = time.getMinutes();
                occupiedTimeSlots.push({ hour, minute });
            }

        })

        const availableTimeSlots = allTimeSlots.filter((slot) => {
            return !occupiedTimeSlots.some(occupiedTimeSlots => {
                return occupiedTimeSlots.hour === slot.hour && occupiedTimeSlots.minute === slot.minute;
            })
        })
        // console.log(occupiedTimeSlots);

        // console.log(availableTimeSlots);


        // console.log(totalDuration)

        //FILTER OUT OUT OF WORKING HOURS AND OVERLAP TIME SLOTS
        const filteredAvailableTimeSlots = availableTimeSlots.filter((slot) => {
            const dateTime = new Date(selectedDate);
            dateTime.setHours(slot.hour);
            dateTime.setMinutes(slot.minute);
            const closingDateTime = new Date(selectedDate);
            closingDateTime.setHours(closeHour);
            const durationInMillisecond = parseInt(totalDuration) * 60000;

            const endDateTime = new Date(dateTime.getTime() + durationInMillisecond);

            if (endDateTime > closingDateTime) {
                return false;
            }
            else {
                return true;
                //not working trty do it in a reversed way, since 11:45 is still here,  we check if the end time is in the occupied list

            }
        }).filter((slot) => {
            const dateTime = new Date(selectedDate);
            dateTime.setHours(slot.hour);
            dateTime.setMinutes(slot.minute);

            const durationInMillisecond = parseInt(totalDuration) * 60000;

            const endDateTime = new Date(dateTime.getTime() + durationInMillisecond);
            endDateTime.setMinutes(endDateTime.getMinutes() - 15);
            const endHour = endDateTime.getHours();
            const endMinute = endDateTime.getMinutes();


            const endDateTimeLastTimeSlot = { hour: endHour, minute: endMinute };
            const exists = occupiedTimeSlots.find((slotOccupied) => {
                return (slotOccupied.hour === endDateTimeLastTimeSlot.hour && slotOccupied.minute === endDateTimeLastTimeSlot.minute)
            })
            if (exists) {
                return false;
            }
            else {
                // console.log(slot.hour + ' ' + slot.minute + ' ' + endHour + ' ' + endMinute)
                return true;
            }

        }).filter((slot) => {
            const dateTime = new Date(selectedDate);
            dateTime.setHours(slot.hour);
            dateTime.setMinutes(slot.minute);

            const durationInMillisecond = parseInt(totalDuration) * 60000;

            const endDateTime = new Date(dateTime.getTime() + durationInMillisecond);

            const overlap = occupiedTimeSlots.map((value) => {
                const bookedTime = new Date(selectedDate);
                bookedTime.setHours(value.hour);
                bookedTime.setMinutes(value.minute);
                return (endDateTime > bookedTime && dateTime < bookedTime)
            })
            // console.log(overlap);

            if (overlap.some(value => value === true)) {
                return false;
            }
            else {
                return true;
            }

        });
        // console.log(filteredAvailableTimeSlots);
        const formattedTimeSlots = await reformatTimeSlots(filteredAvailableTimeSlots);
        return formattedTimeSlots;
    } catch (err) {
        throw new Error(err.message);
    }

    // Sample response schema
    // const schema = [[{ hour: 10, minutes: [0, 30] }, { hour: 12, minutes: [0, 15, 30, 45] }, { hour: 15, minutes: [0, 15] }], { startHour: 10, offHour: 19 }];
}

const reformatTimeSlots = async (availableTimeSlots) => {
    try {
        return availableTimeSlots.reduce((prev, slot) => {
            const lastSlot = prev[prev.length - 1];

            if (lastSlot && lastSlot.hour === slot.hour) {
                lastSlot.minutes.push(slot.minute);
            }
            else {
                prev.push({ hour: slot.hour, minutes: [slot.minute] });
            }
            return prev;
        }, []);
    }
    catch (err) {
        throw new Error('Fail to Reformat Time Slots');
    }

}

const fetchWorkingHoursTimeSlots = async () => {
    try {
        const openHour = parseInt(process.env.WORKING_HOUR);
        const closeHour = parseInt(process.env.CLOSING_HOUR);

        const allTimeSlots = [];

        for (let hour = openHour; hour < closeHour; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                allTimeSlots.push({ hour, minute });
            }
        }
        const formattedTimeSlots = await reformatTimeSlots(allTimeSlots);
        return formattedTimeSlots;

    } catch (error) {
        throw new Error('Working Hours are not Defined')
    }
}

const fetchAvailableSpecialistsDuringProvidedTime = async (queryData) => {
    try {
        const { specialists, selectedServices, selectedTime } = queryData;
        const dateOnly = selectedTime.slice(0, 10);
        const available = await Promise.all(
            specialists.map(async (value) => {
                try {
                    const selectedDateTime = new Date(selectedTime);
                    const selectedHour = selectedDateTime.getHours();
                    const selectedMinute = selectedDateTime.getMinutes();
                    // console.log(selectedHour)
                    // console.log(selectedMinute)
                    const allAvailableTimeSlots = await fetchSpecialistAvailableTimeSlots({ selectedServices, selectedSpecialist: value.staffId, selectedDate: dateOnly })
                    // console.log(value.staffId)
                    // console.log(allAvailableTimeSlots)
                    return {
                        ...value,
                        available: (allAvailableTimeSlots.some(slot => slot.hour === selectedHour && slot.minutes.includes(selectedMinute))),
                    }
                } catch (error) {
                    throw new Error(error.message);
                }
            })
        )
        // console.log(available)
        const availableSpecialists = available.filter(value => value.available === true).map(value => {
            return {
                staffId: value.staffId,
                staffName: value.staffName,
            }
        });
        console.log(availableSpecialists)
        return availableSpecialists;
    } catch (err) {
        throw new Error(err.message);
    }
}

const appointmentCancellation = async (appointmentId) => {
    try {
        const sql = "UPDATE APPOINTMENT SET APPOINTMENT_STATUS = 'Cancelled' WHERE APPOINTMENT_ID = ?";

        const [result] = await connection.execute(sql, [appointmentId]);
        const rowAffected = result.affectedRows;

        if (rowAffected <= 0) {
            return {
                status: 'error',
                message: 'Failed to Cancel the Appointment',
            }
        }

        return {
            status: 'success',
            message: 'Successfully Cancelled the Appointment',
        }
    } catch (err) {
        throw new Error(err.message);
    }


}

const fetchAppointmentHistorySSFeedback = async (details) => {
    try {
        const {id, role} = details;
 
        let sql = null;

        if (role === 'customer') {
            sql = "SELECT APPOINTMENT_ID AS appointmentId, APPOINTMENT_END_DATE_TIME AS appointmentDate FROM APPOINTMENT WHERE CUSTOMER_ID = ? AND APPOINTMENT_FEEDBACK_RECEIVED = 0 AND APPOINTMENT_STATUS = 'Completed'";
        }

        else if (role === 'guest') {
            sql = "SELECT APPOINTMENT_ID AS appointmentId, APPOINTMENT_END_DATE_TIME AS appointmentDate FROM APPOINTMENT WHERE GUEST_ID = ? AND APPOINTMENT_FEEDBACK_RECEIVED = 0 AND APPOINTMENT_STATUS = 'Completed'";
        }

        const [result] = await connection.execute(sql, [id]);

        if (result.length === 0) {
            return {
                status: 'error',
                message: 'No Completed Appointments Found, or Feedback has Already been Provided for All Completed Appointments.',
                data: null,
            }
        }

        const reformat = result.map(value => {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Kuala_Lumpur' };
            const dateString = value.appointmentDate.toLocaleDateString('en-MY', options).replace(/\//g, '-');
            return { ...value, appointmentDate: dateString };

        });

        return {
            status: 'success',
            message: 'Successfully Fetched Appointments for Feedback',
            data: reformat,
        }
    } catch (err) {
        throw new Error(err.message);
    }
};

const submitNewServiceSpecificFeedback = async (serviceSpecificFeedbackDetails) => {
    try {

        const { appointmentId, overallServiceRating, cleaninessRating, serviceSatisfactionRating, communicationRating, feedbackCategory, feedbackComments } = serviceSpecificFeedbackDetails;


        let category = null;
        if (feedbackCategory === 'praise') {
            category = 'Praise';
        }
        else if (feedbackCategory === 'improvement') {
            category = 'Improvement';
        }
        else if (feedbackCategory === 'complaint') {
            category = 'Complaint';
        }
        else {
            throw new Error('Feedback Type Category Not Exists')
        }

        console.log(serviceSpecificFeedbackDetails)
        await connection.query('START TRANSACTION');

        //INSERT INTO SERVICESPECIFICFEEDBACK TABLE
        const sql = "INSERT INTO SERVICESPECIFICFEEDBACK (APPOINTMENT_ID, SERVICESPECIFICFEEDBACK_CATEGORY, SERVICESPECIFICFEEDBACK_COMMENTS, SERVICESPECIFICFEEDBACK_OVERALL_SERVICE_RATING,SERVICESPECIFICFEEDBACK_CLEANINESS_RATING, SERVICESPECIFICFEEDBACK_SERVICE_SATISFACTION_RATING, SERVICESPECIFICFEEDBACK_COMMUNICATION_RATING) VALUES (?,?,?,?,?,?,?)";

        const [newServiceSpecificFeedbackResult] = await connection.execute(sql, [appointmentId, category, feedbackComments, overallServiceRating, cleaninessRating, serviceSatisfactionRating, communicationRating]);

        const rowAffectedSSFeedback = newServiceSpecificFeedbackResult.affectedRows;

        if (rowAffectedSSFeedback <= 0) {
            throw new Error('Failed to Insert into ServiceSpecificFeedback Table');
        }

        //CHANGE APPOINTMENT FEEDBACK_RECEIVED TO TRUE (1)
        const sql2 = "UPDATE APPOINTMENT SET APPOINTMENT_FEEDBACK_RECEIVED = 1 WHERE APPOINTMENT_ID = ?";
        const [feedbackReceivedResult] = await connection.execute(sql2, [appointmentId]);

        const rowAffectedUpdateAppointment = feedbackReceivedResult.affectedRows;

        if (rowAffectedUpdateAppointment <= 0) {
            throw new Error('Failed to Failed to Update Appointment Received in Appointment Table');
        }

        await connection.query('COMMIT');
        return {
            status: 'success',
            message: 'Successfully Submitted Service Specific Feedback',
        }
    } catch (err) {
        await connection.query('ROLLBACK');
        throw new Error(err.message);
    }
};

const fetchOwnProfileDetails = async (customerId) => {
    try {
        const sql = "SELECT u.USER_USERNAME AS username, c.CUSTOMER_FULL_NAME AS name, u.USER_EMAIL AS email, c.CUSTOMER_CONTACT_NUMBER AS contact, c.CUSTOMER_GENDER AS gender, c.CUSTOMER_BIRTHDATE AS birthdate FROM CUSTOMER c INNER JOIN USER u ON c.USER_ID = u.USER_ID WHERE CUSTOMER_ID = ?";

        const [profileDetailsResult] = await connection.execute(sql, [customerId]);

        if (profileDetailsResult.length === 0) {
            return {
                status: 'error',
                message: 'No Profile Found',
                data: null,
            }
        }


        const [profile] = profileDetailsResult;

        return {
            status: 'success',
            message: 'Successfully Submitted General Feedback',
            data: { ...profile, password: null, },
        }

    } catch (err) {
        throw new Error(err.message);
    }
};

const updateNewProfileDetails = async (customerId, profileDetails) => {

    try {

        const { username, name, email, contact, gender, birthdate, password } = profileDetails;
        //check if password got or not if yes, then encrpytion and store it

        let hashedPassword = null;
        if (password !== null) {
            hashedPassword = await hashPassword(password);
        }

        if (password !== null && (hashedPassword === undefined || hashedPassword === null)) {
            throw new Error('Failed to Hash Password');
        }


        await connection.query('START TRANSACTION');

        //UPDATE CUSTOMER TABLE
        const sql = "UPDATE CUSTOMER SET CUSTOMER_FULL_NAME = ?, CUSTOMER_BIRTHDATE = ?, CUSTOMER_CONTACT_NUMBER = ? WHERE CUSTOMER_ID = ?";

        const [updateCustomerResult] = await connection.execute(sql, [name, birthdate, contact, customerId]);
        const rowAffectedCustomer = updateCustomerResult.affectedRows;

        if (rowAffectedCustomer <= 0) {
            throw new Error('Failed to Update Customer Profile Details in Customer Table');
        }


        //UPDATE USER TABLE

        let sql2 = null;
        let params = [];
        if (password !== null && hashedPassword !== null) {
            sql2 = "UPDATE USER SET USER_PASSWORD_HASH = ?, USER_EMAIL = ? WHERE USER_USERNAME = ?";
            params = [hashedPassword, email, username];
        }
        else {
            sql2 = "UPDATE USER SET USER_EMAIL = ? WHERE USER_USERNAME = ?";
            params = [email, username];
        }

        const [updateUserResult] = await connection.execute(sql2, params);
        const rowAffectedUser = updateUserResult.affectedRows;

        if (rowAffectedUser <= 0) {
            throw new Error('Failed to Update Customer Profile Details in User Table');
        }

        await connection.query('COMMIT');

        return {
            status: 'success',
            message: 'Successfully Updated Customer Profile',
        }

    } catch (err) {
        await connection.query('ROLLBACK');
        throw new Error(err.message);
    }


}

module.exports = { getAllServices, getMatchSpecialists, createNewAppointment, fetchSpecialistAvailableTimeSlots, fetchWorkingHoursTimeSlots, fetchAvailableSpecialistsDuringProvidedTime, appointmentCancellation, handleDeposit, fetchAppointmentHistorySSFeedback, submitNewServiceSpecificFeedback, fetchOwnProfileDetails, updateNewProfileDetails, };