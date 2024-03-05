const { calendar } = require('googleapis/build/src/apis/calendar');
const { userRegistration, } = require('../services/authService');
const { getAllServices, getMatchSpecialists, createNewAppointment, fetchSpecialistAvailableTimeSlots, fetchWorkingHoursTimeSlots, fetchAvailableSpecialistsDuringProvidedTime, appointmentCancellation, handleDeposit, } = require('../services/customerService');

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
        console.log(err)
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

const getWorkingTimeSlots = async () => {
    try {
        const response = await fetchWorkingHoursTimeSlots();
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

const payDeposit = async (summaryDetails) => {
    try {
        const response = await handleDeposit(summaryDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}


module.exports = { registerUser, getServices, getSpecialists, createAppointment, getAvailableTimeSlots, getWorkingTimeSlots, checkAvailableSpecialists, checkAvailableSpecialists, cancelAppointment, payDeposit, };