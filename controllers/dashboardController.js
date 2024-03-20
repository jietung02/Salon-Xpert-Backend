const { fetchAllStaffCalendarIds } = require('../services/dashboardService');


const fetchStaffCalendarIds = async () => {
    try {
        const response = await fetchAllStaffCalendarIds();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = { fetchStaffCalendarIds, };