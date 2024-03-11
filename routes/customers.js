
const express = require('express');
const router = express.Router();

const { registerUser, getServices, getSpecialists, createAppointment, getAvailableTimeSlots, getWorkingTimeSlots, checkAvailableSpecialists, cancelAppointment, payDeposit, } = require('../controllers/customerController');
const { getCalendar, createNewCalendar, checkTimeAvailability } = require('../services/calendarService');

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
    console.log(err.message)
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
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});



//Fetch Matched Services Specialists (Staff)
router.post('/match-specialists', async (req, res) => {
  try {
    const selectedServices = req.body;

    if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
      return res.status(400).json({ error: 'No Services Selected' });
    }

    const specialists = await getSpecialists(selectedServices);
    console.log('MAtch')
    console.log(specialists);
    if (specialists.length === 0) {
      return res.status(404).json({ error: 'No Specialists Found' });
    }
    return res.status(200).json(specialists);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});

//Fetch the Selected Specialists Schedule
router.post('/specialist-timeslots', async (req, res) => {
  try {

    const { selectedServices, selectedSpecialist, selectedDate } = req.body;
    console.log(req.body)

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
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});

//Fetch All Available Time Slots
router.get('/working-hours', async (req, res) => {
  try {

    const timeSlots = await getWorkingTimeSlots();

    if (timeSlots.length === 0) {
      return res.status(404).json({ error: 'No Timeslot Available' });
    }
    return res.status(200).json(timeSlots);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});

//Fetch Specialists Avaiable for Selected Services following the Selected Date Time
router.post('/specialists-available', async (req, res) => {
  try {
    const { specialists, selectedServices, selectedTime } = req.body;

    console.log(req.body);
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
    console.log(err.message);
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

//PAY DEPOSIT
router.put('/appointment/update/:appointmentId', async (req, res) => {

  try {
    const summaryDetails = req.body;

    if (summaryDetails === undefined || summaryDetails === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Appointment Details' });
    }

    const { appoinmentId, name, email, servicesName, specialist, startDateTime, endDateTime, estimatedPrice, depositAmount, from, } = summaryDetails;
    if (appoinmentId === null || name === null || email === null || servicesName === null || specialist === null || startDateTime === null || endDateTime === null || estimatedPrice === null || depositAmount === null || from === null) {
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
router.get('/appointment/history/:customerId', (req, res) => {
  res.send('Retrieve all history of a customer');
});

//Leave Feedback
router.post('/feedback/service-specific-feedback', (req, res) => {
  res.send('New service specific feedback');
});

router.post('/feedback/general', (req, res) => {
  res.send('New general feedback');
});

router
  .route('/:userId')
  .get((req, res) => {
    req.params.userId
    res.send('Customer GEt');
  })
  .put((req, res) => {
    req.params.userId
    res.send('Customer Update');
  }).delete((req, res) => {
    req.params.userId
    res.send('Customer Delete');
  });

module.exports = router;
//make sure to place static route on top, as js will go top to bottom