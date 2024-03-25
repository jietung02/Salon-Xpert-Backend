const { fetchAllSpecialists, generateSelectedReport, } = require('../services/reportsService');


const fetchSpecialists = async () => {
    try {
        const response = await fetchAllSpecialists();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const generateReport = async (reportDetails) => {
    try {
        const response = await generateSelectedReport(reportDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchSpecialists, generateReport, };