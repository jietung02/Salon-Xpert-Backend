const express = require('express');

const router = express.Router();

//Configure Service
router.get('/services', (req, res) => {
  res.send('Retrieve all Services');
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