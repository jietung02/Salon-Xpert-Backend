const express = require('express');

const router = express.Router();
const path = require('path');
const { fetchSpecialists, generateReport, } = require('../controllers/reportsController');


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


//Generate Report
router.post('/generate', async (req, res) => {

    try {
        const reportDetails = req.body;


        if ((reportDetails.selectedReport === 'feedbackReport' && (reportDetails.dateFrom === null || reportDetails.dateTo === null)) || (reportDetails.selectedReport === 'revenueReport' && (reportDetails.dateFrom === null || reportDetails.dateTo === null))) {
            return res.status(400).json({ status: 'error', message: 'Missing Required Report Details' });

        }

        const response = await generateReport(reportDetails);
        if (response.status === 'error') {
            return res.status(404).json(response);
        }
        return res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message, data: null, })
    }
});

router.get('/staff-performance-report/layout', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../reportsLayout', 'staffPerformanceReport.rdlx-json'));

});

router.get('/feedback-report/layout', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../reportsLayout', 'feedbackReport.rdlx-json'));

});

router.get('/revenue-report/layout', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../reportsLayout', 'revenueReport.rdlx-json'));

});

module.exports = router;