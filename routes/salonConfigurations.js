const express = require('express');
const { fetchAllServices, addNewService, editService, deleteService, fetchAllProfiles, fetchAllRoles, fetchServices, createStaffProfile, editStaffProfile, deleteStaffProfile ,} = require('../controllers/salonConfigurationController');
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
      return res.status(400).json({ status: 'error', message: 'Missing Required Service Details' });
    }
    const { serviceCode, serviceName, serviceDuration, serviceBasedPrice } = serviceDetails;

    if (serviceCode === null || serviceName === null || serviceDuration === null || serviceBasedPrice === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Service Details' });
    }

    const response = await addNewService(serviceDetails);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }

});

router
  .route('/services/:serviceCode')
  .get((req, res) => {
    res.send('Retrieve specific staff profile');
  }).put(async (req, res) => {
    try {
      const serviceDetails = req.body;

      if (serviceDetails === undefined || serviceDetails === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Service Details' });
      }
      const { serviceCode, serviceName, serviceDuration, serviceBasedPrice } = serviceDetails;

      if (serviceCode === null || serviceName === null || serviceDuration === null || serviceBasedPrice === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Service Details' });
      }

      const response = await editService(serviceDetails);

      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }


  }).delete(async (req, res) => {
    try {
      const serviceCode = req.params.serviceCode;

      if (serviceCode === undefined || serviceCode === null) {
        return res.status(400).json({ status: 'error', message: 'No Service Code Provided' });
      }

      const response = await deleteService(serviceCode);

      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }
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
router.get('/staff-profiles', async (req, res) => {
  try {
    const response = await fetchAllProfiles();
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null, additionalData: null, })
  }
});

router.get('/staff-profiles/roles', async (req, res) => {
  try {
    const response = await fetchAllRoles();
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

router.get('/staff-profiles/services', async (req, res) => {
  try {
    const response = await fetchServices();
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

router.post('/staff-profiles/new', async (req, res) => {
  try {
    const profileDetails = req.body;

    if (profileDetails === undefined || profileDetails === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Staff Profile Details', });
    }

    const { staffName, staffEmail, staffUsername, staffPassword, staffContact, staffRole, servicesProvided, staffBio } = profileDetails;

    if (staffName === null || staffEmail === null || staffUsername === null || staffPassword === null || staffContact === null || staffRole === null || !Array.isArray(servicesProvided) || staffBio === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Staff Profile Details', });
    }
    const response = await createStaffProfile(profileDetails);
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

router
  .route('/staff-profiles/:staffId')
  .get((req, res) => {
    res.send('Retrieve specific staff profile');
  }).put(async (req, res) => {

    try {
      const profileDetails = req.body;

      if (profileDetails === undefined || profileDetails === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Staff Profile Details' });
      }
      const { staffId, staffUsername, staffName, staffEmail, staffRole, servicesProvided, staffContact, staffBio } = profileDetails;

      if (staffId === null || staffUsername === null || staffName === null || staffEmail === null || staffRole === null || !Array.isArray(servicesProvided) || staffContact === null || staffBio === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Staff Profile Details' });
      }

      const response = await editStaffProfile(profileDetails);

      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }

  }).delete(async (req, res) => {

    try {
      const staffId = req.params.staffId;

      if (staffId === undefined || staffId === null) {
        return res.status(400).json({ status: 'error', message: 'No Staff ID Provided' });
      }

      const response = await deleteStaffProfile(staffId);

      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }

  });


module.exports = router;