const { fetchAllSpecialists } = require('../services/reportsService');


const fetchSpecialists = async () => {
    try {
        const response = await fetchAllSpecialists();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchSpecialists };