const { connection } = require('../config/dbConnection');
const { sendPaymentEmail } = require('../services/sendEmailService');

const fetchStaffCalendarId = async (staffId) => {
    try {
        const sql = "SELECT STAFF_CALENDAR_ID AS calendarId FROM staff WHERE STAFF_ID = ?";

        const [calIdResult] = await connection.execute(sql, [staffId]);

        const [{ calendarId }] = calIdResult;
        if (calendarId === null) {
            return {
                status: 'error',
                message: 'No Calendar ID found or Not Service Provider',
                data: null,
            }
        }

        const reformatToStringUrl = calIdResult.map(value => `src=${value.calendarId}`).join();

        return {
            status: 'success',
            message: 'Successfully Fetched All Feedback',
            data: reformatToStringUrl,
        }

    } catch (err) {
        throw new Error(err.message);
    }
};

const fetchAllTodayAppointments = async () => {
    try {
        let sql = null;

        if (process.env.NODE_ENV === 'production') {
            sql = "SELECT a.APPOINTMENT_ID AS appointmentId, a.STAFF_ID AS staffId, s.STAFF_FULL_NAME AS staffName, COALESCE(a.CUSTOMER_ID, a.GUEST_ID) AS custOrGuestId, COALESCE(c.CUSTOMER_FULL_NAME, g.GUEST_FULL_NAME) AS name, a.APPOINTMENT_ESTIMATED_PRICE AS estimatedPrice, CASE WHEN a.CUSTOMER_ID IS NOT NULL THEN 'customer' ELSE 'guest' END AS appointmentType FROM appointment a INNER JOIN staff s ON a.STAFF_ID = s.STAFF_ID LEFT JOIN customer c ON a.CUSTOMER_ID = c.CUSTOMER_ID LEFT JOIN guest g ON a.GUEST_ID = g.GUEST_ID WHERE DATE(APPOINTMENT_END_DATE_TIME) >= DATE(CONVERT_TZ(CURDATE(), 'UTC', 'Asia/Kuala_Lumpur')) && a.APPOINTMENT_STATUS = 'Scheduled'";
        }
        else {
            sql = "SELECT a.APPOINTMENT_ID AS appointmentId, a.STAFF_ID AS staffId, s.STAFF_FULL_NAME AS staffName, COALESCE(a.CUSTOMER_ID, a.GUEST_ID) AS custOrGuestId, COALESCE(c.CUSTOMER_FULL_NAME, g.GUEST_FULL_NAME) AS name, a.APPOINTMENT_ESTIMATED_PRICE AS estimatedPrice, CASE WHEN a.CUSTOMER_ID IS NOT NULL THEN 'customer' ELSE 'guest' END AS appointmentType FROM appointment a INNER JOIN staff s ON a.STAFF_ID = s.STAFF_ID LEFT JOIN customer c ON a.CUSTOMER_ID = c.CUSTOMER_ID LEFT JOIN guest g ON a.GUEST_ID = g.GUEST_ID WHERE DATE(APPOINTMENT_END_DATE_TIME) >= CURDATE() && a.APPOINTMENT_STATUS = 'Scheduled'";

        }


        const [appointmentsResult] = await connection.execute(sql);

        if (appointmentsResult.length === 0) {
            return {
                status: 'error',
                message: 'No Appointments For Today',
                data: null,
            }
        }

        return {
            status: 'success',
            message: 'Successfully Fetched All Today Appointments',
            data: appointmentsResult,
        }

    } catch (err) {
        throw new Error(err.message);
    }
};

const updateLastServicePrice = async (selectedAppointment) => {
    try {
        const { appointmentId, serviceFinalPrice, appointmentType } = selectedAppointment;

        const paymentPageLink = `${process.env.CLIENT_URI}/${appointmentType === 'customer' ? 'customer' : 'guest'}/payment/${appointmentId}`;

        //UPDATE FINAL SERVICE PRICE
        const sql = "UPDATE appointment SET APPOINTMENT_FINAL_PRICE = ?, APPOINTMENT_PAYMENT_LINK = ?, APPOINTMENT_STATUS = 'PendingFinalPayment' WHERE APPOINTMENT_ID = ?;";
        const [finalPriceResult] = await connection.execute(sql, [serviceFinalPrice, paymentPageLink, appointmentId]);

        const rowAffectedPrice = finalPriceResult.affectedRows;

        if (rowAffectedPrice <= 0) {
            throw new Error('Failed to Update Final Service Price in Appointment Table');
        }

        // SEND EMAIL
        // GET FULL NAME, EMAIL,
        let sql2 = null;
        if (appointmentType === 'customer') {
            sql2 = "SELECT c.CUSTOMER_FULL_NAME AS name, u.USER_EMAIL AS email FROM appointment a INNER JOIN customer c ON a.CUSTOMER_ID = c.CUSTOMER_ID INNER JOIN user u ON c.USER_ID = u.USER_ID WHERE a.APPOINTMENT_ID = ?";
        }
        else {
            sql2 = "SELECT g.GUEST_FULL_NAME AS name, u.USER_EMAIL AS email FROM appointment a INNER JOIN guest g ON a.GUEST_ID = g.GUEST_ID INNER JOIN user u ON g.USER_ID = u.USER_ID WHERE a.APPOINTMENT_ID = ?";
        }

        const [customerDetailsResult] = await connection.execute(sql2, [appointmentId]);
        const [{ name, email }] = customerDetailsResult;
        if (customerDetailsResult.length === 0) {
            return {
                status: 'error',
                message: 'No Customer or Guest Name or Email Found for Emailing the Payment Link',
                data: null,
            }
        }

        await sendPaymentEmail(name, email, paymentPageLink);


        return {
            status: 'success',
            message: 'Successfully Updated Final Service Price and Generated Payment Link',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchStaffCalendarId, fetchAllTodayAppointments, updateLastServicePrice, };