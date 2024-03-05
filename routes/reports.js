const express = require('express');

const router = express.Router();

//Staff Performance Report
router.get('/staff-performance-report', (req, res) => {
    res.send('staff-performance-report');
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