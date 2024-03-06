const { fetchAllSalonServices, createNewService } = require('../services/salonConfigurationService');

const fetchAllServices = async () => {
    try {
        const response = await fetchAllSalonServices();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const addNewService = async (serviceDetails) => {
    try {
        const response = await createNewService(serviceDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchAllServices, addNewService, };