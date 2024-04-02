const { connection } = require('../config/dbConnection');
const moment = require('moment');

const fetchAllStaffCalendarIds = async () => {
    try {
        const sql = "SELECT s.STAFF_CALENDAR_ID as calendarId FROM staff s INNER JOIN role r ON s.ROLE_CODE = r.ROLE_CODE WHERE r.ROLE_IS_SERVICE_PROVIDER = 1";

        const [calIdsResult] = await connection.execute(sql);

        if (calIdsResult.length === 0) {
            return {
                status: 'error',
                message: 'No Staff Calendar IDs Found',
                data: null,
            }
        }

        const reformatToStringUrl = calIdsResult.map(value => `src=${value.calendarId}`).join('&');

        return {
            status: 'success',
            message: 'Successfully Fetched All Roles',
            data: reformatToStringUrl,
        }

    } catch (err) {
        throw new Error(err.message);
    }
};

const fetchDashboardStatistics = async () => {
    try {

        // GET TOTAL ACTIVE APPOINTMENTS
        let sql = null;
        if (process.env.NODE_ENV === 'production') {
            sql = "SELECT COUNT(*) AS totalActiveAppointments FROM appointment WHERE APPOINTMENT_STATUS != 'Cancelled' && APPOINTMENT_STATUS != 'Completed' && (DATE(APPOINTMENT_START_DATE_TIME) >= DATE(CONVERT_TZ(CURDATE(), 'UTC', 'Asia/Kuala_Lumpur')))";
        }
        else {
            sql = "SELECT COUNT(*) AS totalActiveAppointments FROM appointment WHERE APPOINTMENT_STATUS != 'Cancelled' && APPOINTMENT_STATUS != 'Completed' && (DATE(APPOINTMENT_START_DATE_TIME) >= DATE(CURDATE()))"
        }
        const [totalActiveAppointmentsResult] = await connection.execute(sql);
        const [{ totalActiveAppointments }] = totalActiveAppointmentsResult;

        //GET TOTAL CUSTOMERS AND GUESTS (FROM USER)
        const sql2 = "SELECT COUNT(*) AS totalCustomers FROM user WHERE USER_ROLE = 'customer' OR USER_ROLE = 'guest'";
        const [totalCustomersResult] = await connection.execute(sql2);

        const [{ totalCustomers }] = totalCustomersResult;

        // GET TOTAL SERVICE AVAILABLE
        const sql3 = "SELECT COUNT(*) AS totalServices FROM service";
        const [totalServicesResult] = await connection.execute(sql3);
        const [{ totalServices }] = totalServicesResult;
        // if (totalActiveAppointmentsResult.length === 0) {
        //     return {
        //         status: 'error',
        //         message: 'No Staff Calendar IDs Found',
        //         data: null,
        //     }
        // }

        //GET STAFF SERVICE STAFF PROFILES
        const sql4 = "SELECT s.STAFF_FULL_NAME AS staffName, r.ROLE_NAME AS staffRole, s.STAFF_BIO AS staffBio FROM staff s INNER JOIN role r ON s.ROLE_CODE = r.ROLE_CODE WHERE r.ROLE_IS_SERVICE_PROVIDER = 1";
        const [serviceStaffResult] = await connection.execute(sql4);

        const serviceStaffData = serviceStaffResult.map((value) => {
            return [value.staffName, value.staffRole, value.staffBio];
        });

        // GET ALL STAFF UPCOMING APPOINTMENTS
        let sql5 = null;

        if (process.env.NODE_ENV === 'production') {
            sql5 = "SELECT a.APPOINTMENT_ID AS appointmentId, s.STAFF_FULL_NAME AS staffName, COALESCE(c.CUSTOMER_FULL_NAME, g.GUEST_FULL_NAME) AS name, a.APPOINTMENT_START_DATE_TIME AS startDateTime, GROUP_CONCAT(svc.SERVICE_NAME SEPARATOR ', ') AS services FROM appointment a INNER JOIN appointmentservice asvc ON a.APPOINTMENT_ID = asvc.APPOINTMENT_ID INNER JOIN service svc ON asvc.SERVICE_CODE = svc.SERVICE_CODE INNER JOIN staff s ON a.STAFF_ID = s.STAFF_ID LEFT JOIN customer c ON a.CUSTOMER_ID = c.CUSTOMER_ID LEFT JOIN guest g ON a.GUEST_ID = g.GUEST_ID WHERE APPOINTMENT_START_DATE_TIME >= CONVERT_TZ(NOW(), 'UTC', 'Asia/Kuala_Lumpur') && a.APPOINTMENT_STATUS = 'Scheduled' GROUP BY a.APPOINTMENT_ID";
        }
        else {
            sql5 = "SELECT a.APPOINTMENT_ID AS appointmentId, s.STAFF_FULL_NAME AS staffName, COALESCE(c.CUSTOMER_FULL_NAME, g.GUEST_FULL_NAME) AS name, a.APPOINTMENT_START_DATE_TIME AS startDateTime, GROUP_CONCAT(svc.SERVICE_NAME SEPARATOR ', ') AS services FROM appointment a INNER JOIN appointmentservice asvc ON a.APPOINTMENT_ID = asvc.APPOINTMENT_ID INNER JOIN service svc ON asvc.SERVICE_CODE = svc.SERVICE_CODE INNER JOIN staff s ON a.STAFF_ID = s.STAFF_ID LEFT JOIN customer c ON a.CUSTOMER_ID = c.CUSTOMER_ID LEFT JOIN guest g ON a.GUEST_ID = g.GUEST_ID WHERE APPOINTMENT_START_DATE_TIME >= NOW() && a.APPOINTMENT_STATUS = 'Scheduled' GROUP BY a.APPOINTMENT_ID";
        }

        const [allUpcomingAppointments] = await connection.execute(sql5);

        const reformatDate = allUpcomingAppointments.map(value => {
            return {
                ...value,
                startDateTime: moment(value.startDateTime).format('YYYY-MM-DD HH:mm'),
            }
        })

        return {
            status: 'success',
            message: 'Successfully Fetched Admin / Staff Dashboard Statistics',
            data: {
                totalActiveAppointments: totalActiveAppointments,
                totalCustomers: totalCustomers,
                totalServices: totalServices,
                staffProfiles: serviceStaffData,
                allUpcomingAppointments: reformatDate,
            },
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchAllStaffCalendarIds, fetchDashboardStatistics, };