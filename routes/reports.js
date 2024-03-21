const express = require('express');

const router = express.Router();

const { fetchSpecialists } = require('../controllers/reportsController');


//Staff Performance Report
router.get('/staff-performance-report', (req, res) => {
    res.send('staff-performance-report');
});

router.get('/staff-performance-report/specialists', async (req, res) => {

    try {

        const response = await fetchSpecialists();
        if (response.status === 'error') {
            return res.status(404).json(response);
        }
        return res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message, data: null, })
    }
});

//Feedback Report
router.get('/feedback-report', (req, res) => {
    res.send('feedback-report');
});

//Revenue Report
router.get('/revenue-report', (req, res) => {
    res.send('revenue-report');
});

module.exports = router;