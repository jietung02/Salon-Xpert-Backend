
const express = require('express');
const router = express.Router();

const { registerUser, getServices, getSpecialists, createAppointment, getAvailableTimeSlots, getWorkingTimeSlots, checkAvailableSpecialists, cancelAppointment, cancelScheduledAppointment, payDeposit, fetchAppointmentHistoryFeedback, submitServiceSpecificFeedback, fetchProfileDetails, updateProfileDetails, fetchAppointment, makePayment, fetchDashboardData, fetchAppointmentHistory, } = require('../controllers/customerController');

//This register, appointment new, and general feedback, no need middleware

//COMBINE CUSTOMER ENDPOINT WITH GUEST

//Register
router.post('/new', async (req, res) => {

  try {
    const userData = req.body;
    //Authenticate user
    const authData = await registerUser(userData);

    return res.status(200).json();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

//Appointment
router.post('/appointment/new', async (req, res) => {
  try {
    const appointDetails = req.body;

    if (appointDetails === undefined || appointDetails === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Appointment Details', data: null });
    }

    const { name, email, gender, age, contact, selectedServices, bookingmethod, selectedSpecialist, selectedDate, selectedTime, from, } = appointDetails;

    if (name === null || email === null || gender === null || age === 0 || contact === null || selectedServices.length === 0 || bookingmethod === null || selectedSpecialist === null || selectedDate === null || selectedTime === null || from === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Appointment Details', data: null });
    }
    //success
    // {
    //   status: success,
    //     message: 'Appointment Created Successfully',
    //       data: {
    //     appointmentId: '98899',
    //       name: 'Andy',
    //         email: 'andy@gmail.com',
    //           specialist: 'Specialist Name',
    //             appointmentDateTime: '03 February 2024',
    //               estimatedPrice: 34.56,
    //                 depositRequired: 3.4,

    //   }
    // }

    //failed
    // {
    //   status: error,
    //     message: 'Selected timeslot is not available',
    //       data: null
    // }
    const response = await createAppointment(appointDetails);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);
    // await createNewCalendar();
    // res.send('New appointment');
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }

});

//Fetch all Services
router.get('/services', async (req, res) => {
  try {

    const services = await getServices();

    if (services.length === 0) {
      return res.status(404).json({ error: 'No Services Found' });
    }
    return res.status(200).json(services);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});



//Fetch Matched Services Specialists (Staff)
router.post('/match-specialists', async (req, res) => {
  try {
    const selectedServices = req.body;

    if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No Services Selected', data: null });
    }

    const response = await getSpecialists(selectedServices);

    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message, data: null });
  }
});

//Fetch the Selected Specialists Schedule
router.post('/specialist-timeslots', async (req, res) => {
  try {

    const { selectedServices, selectedSpecialist, selectedDate } = req.body;

    if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
      return res.status(400).json({ error: 'No Services Selected' });
    }
    if (selectedDate === null) {
      return res.status(400).json({ error: 'No Service Date Provided' });
    }

    const timeSlots = await getAvailableTimeSlots({ selectedServices, selectedSpecialist, selectedDate })

    if (timeSlots.length === 0) {
      return res.status(404).json({ error: 'No Timeslot Available' });
    }
    return res.status(200).json(timeSlots);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//Fetch All Available Time Slots
router.post('/working-hours', async (req, res) => {
  try {
    const { selectedServices, selectedDate } = req.body;

    if (!Array.isArray(selectedServices) || selectedServices.length === 0 || selectedDate === null) {
      return res.status(400).json({ error: 'No Services or Date Selected' });
    }
    const timeSlots = await getWorkingTimeSlots(selectedServices, selectedDate);

    if (timeSlots.length === 0) {
      return res.status(404).json({ error: 'No Timeslot Available' });
    }
    return res.status(200).json(timeSlots);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//Fetch Specialists Avaiable for Selected Services following the Selected Date Time
router.post('/specialists-available', async (req, res) => {
  try {
    const { specialists, selectedServices, selectedTime } = req.body;

    if (!Array.isArray(specialists) || specialists.length === 0) {
      return res.status(400).json({ error: 'No Specialists in the List' });
    }
    if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
      return res.status(400).json({ error: 'No Services Selected' });
    }
    if (selectedTime === null) {
      return res.status(400).json({ error: 'No Service Date Time Provided' });
    }

    const availableSpecialists = await checkAvailableSpecialists({ specialists, selectedServices, selectedTime })
    if (availableSpecialists.length === 0) {
      return res.status(404).json({ error: 'No Specialists Available During the Time' });
    }
    return res.status(200).json(availableSpecialists);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//CANCEL APPOINTMENT BEFORE DEPOSIT PAID
router.put('/appointment/cancel/:appointmentId', async (req, res) => {

  try {
    const appoinmentId = req.params.appointmentId;

    if (appoinmentId === null) {
      return res.status(400).json({ status: 'error', message: 'No Appointment ID Provided' });
    }

    const response = await cancelAppointment(appoinmentId);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }

});

//CANCEL SCHEDULED APPOINTMENT
router.put('/appointment-scheduled/cancel/:appointmentId', async (req, res) => {

  try {
    const appoinmentId = req.params.appointmentId;

    if (appoinmentId === undefined || appoinmentId === null) {
      return res.status(400).json({ status: 'error', message: 'No Appointment ID Provided' });
    }

    const response = await cancelScheduledAppointment(appoinmentId);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }

});

//PAY DEPOSIT
router.put('/appointment/update/:appointmentId', async (req, res) => {

  try {
    const summaryDetails = req.body;

    if (summaryDetails === undefined || summaryDetails === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Appointment Details' });
    }

    const { appoinmentId, name, email, contact, servicesName, specialist, startDateTime, endDateTime, estimatedPrice, depositAmount, from, } = summaryDetails;
    if (appoinmentId === null || name === null || email === null || contact === null || servicesName === null || specialist === null || startDateTime === null || endDateTime === null || estimatedPrice === null || depositAmount === null || from === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Appointment Details' });
    }

    const response = await payDeposit({ ...summaryDetails });
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }

});

//Appointment History
router.post('/appointment/history/:id', async (req, res) => {

  try {

    const id = req.params.id;

    if (id === undefined || id === null) {
      return res.status(400).json({ status: 'error', message: 'No ID Provided' });
    }

    const response = await fetchAppointmentHistory(id);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

//Leave Feedback
router.post('/feedback/service-specific-feedback/submit', async (req, res) => {

  try {

    const serviceSpecificFeedbackDetails = req.body;

    if (serviceSpecificFeedbackDetails === undefined || serviceSpecificFeedbackDetails === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Service Specific Feedback Details' });
    }

    const { appointmentId, overallServiceRating, cleaninessRating, serviceSatisfactionRating, communicationRating, feedbackCategory, feedbackComments } = serviceSpecificFeedbackDetails;

    if (appointmentId === null || overallServiceRating === null || cleaninessRating === null || serviceSatisfactionRating === null || communicationRating === null || feedbackCategory === null || feedbackComments === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Service Specific Feedback Details' });
    }

    const response = await submitServiceSpecificFeedback(serviceSpecificFeedbackDetails);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});


router.post('/feedback/service-specific-feedback/:id', async (req, res) => {

  try {

    const details = req.body;
    if (details === undefined || details === null) {
      return res.status(400).json({ status: 'error', message: 'No ID or Role Provided' });
    }

    const { id, role } = details;

    if (id === null || role === null) {
      return res.status(400).json({ status: 'error', message: 'No ID or Role Provided' });
    }

    const response = await fetchAppointmentHistoryFeedback(details);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

router
  .route('/:customerId')
  .get(async (req, res) => {

    try {
      const customerId = req.params.customerId;

      const response = await fetchProfileDetails(customerId);
      if (response.status === 'error') {
        return res.status(404).json(response);
      }
      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message, data: null })
    }
  })
  .put(async (req, res) => {

    try {
      const customerId = req.params.customerId;
      const profileDetails = req.body;

      if (customerId === undefined || customerId === null) {
        return res.status(400).json({ status: 'error', message: 'No Customer ID Provided' });
      }

      const { username, name, email, contact, gender, birthdate } = profileDetails;

      if (username === null || name === null || email === null || contact === null || gender === null || birthdate === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Profile Details' });
      }

      const response = await updateProfileDetails(customerId, profileDetails);
      if (response.status === 'error') {
        return res.status(404).json(response);
      }
      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message, data: null })
    }
  }).delete((req, res) => {
    req.params.userId
    res.send('Customer Delete');
  });

//Payment
router.put('/payment/pay/:appointmentId', async (req, res) => {

  try {
    const appointmentId = req.params.appointmentId;

    if (appointmentId === undefined || appointmentId === null) {
      return res.status(400).json({ status: 'error', message: 'No Appointment ID Provided' });
    }

    const response = await makePayment(appointmentId);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});

router.post('/payment/:appointmentId', async (req, res) => {

  try {
    const appointmentId = req.params.appointmentId;

    if (appointmentId === undefined || appointmentId === null) {
      return res.status(400).json({ status: 'error', message: 'No Appointment ID Provided', data: null });
    }

    const response = await fetchAppointment(appointmentId);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

router.post('/dashboard-data/:id', async (req, res) => {

  try {
    const userData = req.body;

    if (userData === undefined || userData === null) {
      return res.status(400).json({ status: 'error', message: 'No ID or Role Provided', data: null });
    }

    const { id, role } = userData;

    if (id === null || role === null) {
      return res.status(400).json({ status: 'error', message: 'No ID or Role Provided', data: null });
    }

    const response = await fetchDashboardData(userData);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});




module.exports = router;
//make sure to place static route on top, as js will go top to bottom