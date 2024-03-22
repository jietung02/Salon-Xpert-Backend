const express = require('express');
const router = express.Router();

const { fetchFeedback, } = require('../controllers/feedbackManagementController');

//Review Feedback
router.get('/', async (req, res) => {

    try {
        const response = await fetchFeedback();
        if (response.status === 'error') {
            return res.status(404).json(response);
        }
        return res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message, data: null, })
    }
});

//could create path with param for filter and sort?

module.exports = router;