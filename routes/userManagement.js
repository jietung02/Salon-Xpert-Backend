const express = require('express');

const router = express.Router();

//Manage Roles
router.get('/roles', (req, res) => {
  res.send('Retrieve all Roles');
});

router.post('/roles/new', (req, res) => {
  res.send('New Role');
});

router
  .route('/roles/:roleCode')
  .get((req, res) => {
    res.send('Retrieve a Role');
  }).put((req, res) => {
    res.send('Modify a Role');
  }).delete((req, res) => {
    res.send('Delete a Role');
  });

//Access Control

router.get('/access-control/:roleCode', (req, res) => {
  res.send('Retrieve a specific role access');
});

router.post('/access-control/new', (req, res) => {

  //check if nothing is passed, just try delete from db
  //if got modify, try delete from db first and insert again.
  //same for new, check existing, then if got delete first and reinsert.
  res.send('New role access');
})

module.exports = router;