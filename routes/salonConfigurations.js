const express = require('express');
const { fetchAllServices, addNewService, } = require('../controllers/salonConfigurationController');
const router = express.Router();

//Configure Service
router.get('/services', async (req, res) => {
  try {

    const response = await fetchAllServices();
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});


router.post('/services/new', async (req, res) => {

  try {
    const serviceDetails = req.body;

    if (serviceDetails === undefined || serviceDetails === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Service Details'});
    }
    const { serviceCode, serviceName, serviceDuration, serviceBasedPrice } = serviceDetails;

    if (serviceCode === null || serviceName === null || serviceDuration === null || serviceBasedPrice === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Service Details'});
    }

    const response = await addNewService(serviceDetails);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message})
  }

});

router
  .route('/services/:serviceCode')
  .get((req, res) => {
    res.send('Retrieve specific staff profile');
  }).put((req, res) => {
    res.send('Modify specific staff profile');
  }).delete((req, res) => {
    res.send('Delete specific staff profile');
  });



//Configure Pricing Options
router.get('/pricing-options', (req, res) => {
  res.send('Retrieve pricing options');
});

router.post('/pricing-options/new', (req, res) => {
  res.send('new pricing options');
});

router.route('/pricing-options/:pricingoptionID')
  .put((req, res) => {
    res.send('modify pricing options');
  });



//Configure Pricing Rules
router.get('/pricing-rules', (req, res) => {
  res.send('Retrieve all pricing rules');
});

router.post('/pricing-rules/new', (req, res) => {
  res.send('New pricing rule');
});

router
  .route('/pricing-rules/:pricingruleId')
  .get((req, res) => {
    res.send('get specific pricing rules');
  })
  .put((req, res) => {
    res.send('Modify specific pricing rule');
  }).delete((req, res) => {
    res.send('delete specific pricing rule');
  });

//Configure Staff Profile
router.get('/staff-profiles', (req, res) => {
  res.send('Retrieve all staff profiles');
});

router.post('/staff-profiles/new', (req, res) => {
  res.send('New staff profile');
});

router
  .route('/staff-profiles/:staffId')
  .get((req, res) => {
    res.send('Retrieve specific staff profile');
  }).put((req, res) => {
    res.send('Modify specific staff profile');
  }).delete((req, res) => {
    res.send('Delete specific staff profile');
  });


module.exports = router;