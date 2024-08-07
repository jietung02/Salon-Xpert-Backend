const express = require('express');
const { fetchAllServices, addNewService, editService, deleteService, fetchAllProfiles, fetchAllRoles, fetchServices, createStaffProfile, editStaffProfile, deleteStaffProfile, fetchPriceOptions, savePriceOptions, fetchPricingRules, fetchAgeCategories, fetchMatchSpecialists, createPricingRule, editPricingRule, deletePricingRule, } = require('../controllers/salonConfigurationController');
const router = express.Router();

//Configure Service
router.get('/services', async (req, res) => {
  try {
    console.log("INNNN");
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
router.get('/pricing-options', async (req, res) => {

  try {
    const response = await fetchPriceOptions();

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

router.put('/pricing-options/save', async (req, res) => {

  try {
    const { priceOptions } = req.body;

    if (!Array.isArray(priceOptions) || priceOptions.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No Price Options Provided' });
    }

    const response = await savePriceOptions(priceOptions);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});

// router.route('/pricing-options/:pricingoptionID')
//   .put((req, res) => {
//     res.send('modify pricing options');
//   });



//Configure Pricing Rules
router.get('/pricing-rules', async (req, res) => {

  try {
    const response = await fetchPricingRules();

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

//Fetch All Services for Pricing Rules Creation
router.get('/pricing-rules/services', async (req, res) => {

  try {
    const response = await fetchServices();

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});


//Fetch All Age Categories Defined by the Salon
router.get('/pricing-rules/age-categories', async (req, res) => {

  try {
    const response = await fetchAgeCategories();

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});

//Fetch All Specialists that Match the Selected Service
router.get('/pricing-rules/match-specialists/:serviceCode', async (req, res) => {

  try {
    const serviceCode = req.params.serviceCode;

    if (serviceCode === undefined || serviceCode === null) {
      return res.status(400).json({ status: 'error', message: 'No Service Code Provided' });
    }
    const response = await fetchMatchSpecialists(serviceCode);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});



router.post('/pricing-rules/new', async (req, res) => {

  try {
    const pricingRuleDetails = req.body;

    if (pricingRuleDetails === undefined || pricingRuleDetails === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Pricing Rule Details' });
    }

    const { serviceCode, priceOptionType, priceOptionValue, priceAdjustment } = pricingRuleDetails;

    if (serviceCode === null || priceOptionType === null || priceOptionValue === null || priceAdjustment === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Pricing Rule Details' });
    }

    const response = await createPricingRule(pricingRuleDetails);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});

router
  .route('/pricing-rules/:pricingRuleId')
  .get((req, res) => {
    res.send('get specific pricing rules');
  })
  .put(async (req, res) => {

    try {
      const pricingRuleDetails = req.body;

      if (pricingRuleDetails === undefined || pricingRuleDetails === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Pricing Rule Details' });
      }

      const { pricingRuleId, serviceCode, priceOptionType, priceOptionValue, priceAdjustment } = pricingRuleDetails;

      if (pricingRuleId === null || serviceCode === null || priceOptionType === null || priceOptionValue === null || priceAdjustment === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Pricing Rule Details' });
      }

      const response = await editPricingRule(pricingRuleDetails);

      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }

  }).delete(async (req, res) => {

    try {
      const pricingRuleId = req.params.pricingRuleId;

      if (pricingRuleId === undefined || pricingRuleId === null) {
        return res.status(400).json({ status: 'error', message: 'No Pricing Rule ID Provided' });
      }

      const response = await deletePricingRule(pricingRuleId);

      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }
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