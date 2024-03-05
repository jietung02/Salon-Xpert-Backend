const express = require('express');

const router = express.Router();

//View Schedule
router.get('/schedule/:staffId', (req,res) => {
    res.send('Retrieve own schedule');
});

//Update Service Price
router.post('/update-service-price/:appointmentId', (req, res) => {
    res.send('Update final price');
});


module.exports = router;