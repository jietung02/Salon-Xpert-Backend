const express = require('express');

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

module.exports = router;