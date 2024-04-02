const { fetchAllStaffCalendarIds, fetchDashboardStatistics, } = require('../services/dashboardService');


const fetchStaffCalendarIds = async () => {
    try {
        const response = await fetchAllStaffCalendarIds();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const fetchDashboardData = async () => {
    try {
        const response = await fetchDashboardStatistics();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchStaffCalendarIds, fetchDashboardData, };