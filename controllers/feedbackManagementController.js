const { fetchAllFeedback, } = require('../services/feedbackManagementService');

const fetchFeedback = async (feedbackType) => {
    try {
        const response = await fetchAllFeedback(feedbackType);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchFeedback, };