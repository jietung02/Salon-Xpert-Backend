const express = require('express');
const { fetchStaffCalendarIds, fetchDashboardData } = require('../controllers/dashboardController');

const router = express.Router();
//This route need middleware
//Dashboard Access
router.get('/', (req, res) => {
    res.send('retrieve everything that the dashboard need');
});

//View Staff Schedules
router.get('/staff-schedules', (req, res) => {
    res.send('retrieve all staff schedules');
});

router.get('/staff-calendar-ids', async (req, res) => {
    try {

        const response = await fetchStaffCalendarIds();
        if (response.status === 'error') {
            return res.status(404).json(response);
        }
        return res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message, data: null })
    }
});

router.get('/statistics', async (req, res) => {
    try {

        const response = await fetchDashboardData();
        if (response.status === 'error') {
            return res.status(404).json(response);
        }
        return res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message, data: null })
    }
});

module.exports = router;