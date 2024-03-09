const { fetchAllSalonServices, createNewService,editExistingService, deleteExistingService,fetchAllStaffProfiles,fetchAllAvailableRoles,fetchAllAvailableServices,} = require('../services/salonConfigurationService');

const fetchAllServices = async () => {
    try {
        const response = await fetchAllSalonServices();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const addNewService = async (serviceDetails) => {
    try {
        const response = await createNewService(serviceDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const editService = async (serviceDetails) => {
    try {
        const response = await editExistingService(serviceDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const deleteService = async (serviceCode) => {
    try {
        const response = await deleteExistingService(serviceCode);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAllProfiles = async () => {
    try {
        const response = await fetchAllStaffProfiles();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAllRoles = async () => {
    try {
        const response = await fetchAllAvailableRoles();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchServices = async () => {
    try {
        const response = await fetchAllAvailableServices();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const createStaffProfile = async (profileDetails) => {
    try {
        const response = await createNewStaffProfile(profileDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchAllServices, addNewService, editService, deleteService, fetchAllProfiles,fetchAllRoles,fetchServices,createStaffProfile,};