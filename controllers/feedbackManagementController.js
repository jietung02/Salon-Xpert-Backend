const { fetchAllFeedback, } = require('../services/feedbackManagementService');

const fetchFeedback = async () => {
    try {
        const response = await fetchAllFeedback();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchFeedback, };