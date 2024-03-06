const { connection } = require('../config/dbConnection');

const fetchAllSalonServices = async () => {
    try {
        const sql = "SELECT SERVICE_CODE AS serviceCode, SERVICE_NAME AS serviceName, SERVICE_DURATION AS serviceDuration, SERVICE_BASED_PRICE AS serviceBasedPrice FROM SERVICE";

        const [serviceResult] = await connection.execute(sql);

        if (serviceResult === 0) {
            return {
                status: 'error',
                message: 'No Services Found',
                data: null,
            }
        }
        const servicesData = serviceResult.map((value) => {
            return [value.serviceCode, value.serviceName, value.serviceDuration, value.serviceBasedPrice];
        })

        return {
            status: 'success',
            message: 'Successfully Fetched All Services',
            data: {
                headers: ['Service Code', 'Service Name', 'Service Duration', 'Service Based Price'],
                servicesData: servicesData
            }
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const createNewService = async (serviceDetails) => {
    try {
        const { serviceCode, serviceName, serviceDuration, serviceBasedPrice } = serviceDetails;
        const sql = "INSERT INTO SERVICE (SERVICE_CODE, SERVICE_NAME, SERVICE_DURATION, SERVICE_BASED_PRICE) VALUES (?, ?, ?, ?)";

        const [newServiceResult] = await connection.execute(sql, [serviceCode, serviceName, serviceDuration, serviceBasedPrice]);
        const rowAffected = newServiceResult.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Insert into Service Table');
        }

        return {
            status: 'success',
            message: 'Successfully Created New Service',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchAllSalonServices, createNewService };