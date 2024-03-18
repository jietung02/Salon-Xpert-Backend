const express = require('express');
const router = express.Router();

const { fetchFeedback, } = require('../controllers/feedbackManagementController');

//Review Feedback
router.get('/:feedbackType', async (req, res) => {

    try {

        const feedbackType = req.params.feedbackType;

        if (feedbackType === undefined || feedbackType === null) {
            return res.status(400).json({ status: 'error', message: 'No Feedback Type Provided' });
        }
        const response = await fetchFeedback(feedbackType);
        if (response.status === 'error') {
            return res.status(404).json(response);
        }
        return res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message, data: null, additionalData: null, })
    }
});

//could create path with param for filter and sort?

module.exports = router;