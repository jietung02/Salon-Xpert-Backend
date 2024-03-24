const express = require('express');

const router = express.Router();

const { fetchCalendarId, fetchTodayAppointments, updateFinalServicePrice, } = require('../controllers/serviceManagementController');

//View Schedule
//Fetch Calendar ID
router.post('/schedule/:staffId', async (req, res) => {

  try {
    const staffId = req.params.staffId;

    if (staffId === undefined || staffId === null) {
      return res.status(400).json({ status: 'error', message: 'No ID Provided' });
    }


    const response = await fetchCalendarId(staffId);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});

//Update Service Price
//Get Today Appointments
router.get('/update-service-price/appointments', async (req, res) => {

  try {

    const response = await fetchTodayAppointments();
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});


router.put('/update-service-price/:appointmentId', async (req, res) => {

  try {
    const selectedAppointment = req.body;

    if (selectedAppointment === undefined || selectedAppointment === null) {
      return res.status(400).json({ status: 'error', message: 'No Selected Appointment Provided' });
    }
    const { appointmentId, serviceFinalPrice, appointmentType } = selectedAppointment;

    if (appointmentId === null || serviceFinalPrice === null || appointmentType === null) {
      return res.status(400).json({ status: 'error', message: 'No Appointment ID or Final Service Price Provided or Appointment Type' });
    }

    const response = await updateFinalServicePrice(selectedAppointment);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});


module.exports = router;