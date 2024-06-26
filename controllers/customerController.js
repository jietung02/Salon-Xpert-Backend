const { calendar } = require('googleapis/build/src/apis/calendar');
const { userRegistration, } = require('../services/authService');
const { getAllServices, getMatchSpecialists, createNewAppointment, fetchSpecialistAvailableTimeSlots, fetchWorkingHoursTimeSlots, fetchAvailableSpecialistsDuringProvidedTime, appointmentCancellation, scheduledAppointmentCancellation, handleDeposit, fetchAppointmentHistorySSFeedback, submitNewServiceSpecificFeedback, fetchOwnProfileDetails, updateNewProfileDetails, fetchAppointmentDetails, makeFinalPayment, fetchCustomerDashboardData, fetchAllAppointmentHistory, } = require('../services/customerService');

const registerUser = async (userData) => {

    const requiredFields = ['username', 'password', 'email', 'name', 'gender', 'birthdate', 'contact'];
    const isValid = requiredFields.every(field => userData[field] !== undefined);

    if (!isValid) {
        return {

            error: 'Validation failed',
            details: {
                username: userData.username === undefined ? 'Username is required' : null,
                password: userData.password === undefined ? 'Password is required' : null,
                email: userData.email === undefined ? 'Email is required' : null,
                name: userData.name === undefined ? 'Name is required' : null,
                gender: userData.gender === undefined ? 'Gender is required' : null,
                birthdate: userData.birthdate === undefined ? 'Birthdate is required' : null,
                contact: userData.contact === undefined ? 'Contact is required' : null,
            }

        }
    };

    try {
        const response = await userRegistration(userData);

        return;
    } catch (err) {
        throw new Error(err.message);
    }

}

const getServices = async () => {
    try {
        const services = await getAllServices();
        return services;
    } catch (err) {
        throw new Error(err.message);
    }

}

const getSpecialists = async (selectedServices) => {
    try {
        const specialists = await getMatchSpecialists(selectedServices);
        return specialists;
    } catch (err) {
        throw new Error(err.message);
    }

}

const createAppointment = async (appointDetails) => {
    try {

        const response = await createNewAppointment(appointDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const getAvailableTimeSlots = async (queryData) => {
    try {
        const response = await fetchSpecialistAvailableTimeSlots(queryData);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const getWorkingTimeSlots = async (selectedServices, selectedDate) => {
    try {
        const response = await fetchWorkingHoursTimeSlots(selectedServices, selectedDate);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const checkAvailableSpecialists = async (queryData) => {
    try {
        const response = await fetchAvailableSpecialistsDuringProvidedTime(queryData);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const cancelAppointment = async (appointmentId) => {
    try {
        const response = await appointmentCancellation(appointmentId);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const cancelScheduledAppointment = async (appointmentId) => {
    try {
        const response = await scheduledAppointmentCancellation(appointmentId);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const payDeposit = async (summaryDetails) => {
    try {
        const response = await handleDeposit(summaryDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAppointmentHistoryFeedback = async (details) => {
    try {
        const response = await fetchAppointmentHistorySSFeedback(details);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const submitServiceSpecificFeedback = async (serviceSpecificFeedbackDetails) => {
    try {
        const response = await submitNewServiceSpecificFeedback(serviceSpecificFeedbackDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchProfileDetails = async (customerId) => {
    try {
        const response = await fetchOwnProfileDetails(customerId);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const updateProfileDetails = async (customerId, profileDetails) => {
    try {
        const response = await updateNewProfileDetails(customerId, profileDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAppointment = async (appointmentId) => {
    try {
        const response = await fetchAppointmentDetails(appointmentId);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const makePayment = async (appointmentId) => {
    try {
        const response = await makeFinalPayment(appointmentId);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const fetchDashboardData = async (userData) => {
    try {
        const response = await fetchCustomerDashboardData(userData);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAppointmentHistory = async (id) => {
    try {
        const response = await fetchAllAppointmentHistory(id);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { registerUser, getServices, getSpecialists, createAppointment, getAvailableTimeSlots, getWorkingTimeSlots, checkAvailableSpecialists, checkAvailableSpecialists, cancelAppointment, cancelScheduledAppointment, payDeposit, fetchAppointmentHistoryFeedback, submitServiceSpecificFeedback, fetchProfileDetails, updateProfileDetails, fetchAppointment, makePayment, fetchDashboardData, fetchAppointmentHistory, };