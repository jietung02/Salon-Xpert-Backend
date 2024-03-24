const { connection } = require('../config/dbConnection');

const fetchAllStaffCalendarIds = async () => {
    try {
        const sql = "SELECT s.STAFF_CALENDAR_ID as calendarId FROM STAFF s INNER JOIN ROLE r ON s.ROLE_CODE = r.ROLE_CODE WHERE r.ROLE_IS_SERVICE_PROVIDER = 1";

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

module.exports = { fetchAllStaffCalendarIds };