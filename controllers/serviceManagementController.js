const { fetchStaffCalendarId, fetchAllTodayAppointments, updateLastServicePrice, } = require('../services/serviceManagementService');


const fetchCalendarId = async (staffId) => {
    try {
        const response = await fetchStaffCalendarId(staffId);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const fetchTodayAppointments = async () => {
    try {
        const response = await fetchAllTodayAppointments();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const updateFinalServicePrice = async (selectedAppointment) => {
    try {
        const response = await updateLastServicePrice(selectedAppointment);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = { fetchCalendarId, fetchTodayAppointments, updateFinalServicePrice, };