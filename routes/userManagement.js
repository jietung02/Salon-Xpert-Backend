const express = require('express');

const router = express.Router();

const { fetchRoles, addNewRole, editRole, deleteRole, fetchRolesObj, fetchPermissionCategories, fetchRolePermissions, saveRoleAccess, } = require('../controllers/userManagementController');

//Manage Roles
router.get('/roles', async (req, res) => {

  try {
    const response = await fetchRoles();
    if (response.status === 'error') {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }

});

router.post('/roles/new', async (req, res) => {

  try {
    const roleDetails = req.body;

    if (roleDetails === undefined || roleDetails === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Role Details' });
    }
    const { roleCode, roleName, roleDescription, roleIsServiceProvider } = roleDetails;

    if (roleCode === null || roleName === null || roleDescription === null || roleIsServiceProvider === null) {
      return res.status(400).json({ status: 'error', message: 'Missing Required Role Details' });
    }

    const response = await addNewRole(roleDetails);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});

router
  .route('/roles/:roleCode')
  .get((req, res) => {
    res.send('Retrieve a Role');
  }).put(async (req, res) => {

    try {
      const roleDetails = req.body;

      if (roleDetails === undefined || roleDetails === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Role Details' });
      }
      const { roleCode, roleName, roleDescription, roleIsServiceProvider } = roleDetails;

      if (roleCode === null || roleName === null || roleDescription === null || roleIsServiceProvider === null) {
        return res.status(400).json({ status: 'error', message: 'Missing Required Role Details' });
      }

      const response = await editRole(roleDetails);

      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }
  }).delete(async (req, res) => {

    try {
      const roleCode = req.params.roleCode;

      if (roleCode === undefined || roleCode === null) {
        return res.status(400).json({ status: 'error', message: 'No Role Code Provided' });
      }

      const response = await deleteRole(roleCode);

      return res.status(200).json(response);

    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }
  });

//Access Control
router.get('/access-control/roles', async (req, res) => {

  try {

    const response = await fetchRolesObj();

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null })
  }
});


//Fetch All Available Permission Categories
router.get('/access-control/permission-categories', async (req, res) => {

  try {

    const response = await fetchPermissionCategories();

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null, })
  }
});

//Fetch All Existing Role Permissions
router.get('/access-control/role-permissions/:roleCode', async (req, res) => {

  try {
    const roleCode = req.params.roleCode;

    if (roleCode === undefined || roleCode === null) {
      return res.status(400).json({ status: 'error', message: 'No Role Code Provided' });
    }
    const response = await fetchRolePermissions(roleCode);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
});


//maybe can be changed in the future
router.get('/access-control/:roleCode', (req, res) => {
  res.send('Retrieve a specific role access');
});

router.post('/access-control/save', async (req, res) => {

  try {
    const rolePermissions = req.body;

    if (rolePermissions === undefined || rolePermissions === null) {
      return res.status(400).json({ status: 'error', message: 'No Role Access Provided' });
    }

    const { roleCode, permissions } = rolePermissions;

    if (roleCode === null || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No Role Access Provided' });
    }
    const response = await saveRoleAccess(rolePermissions);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }

});

module.exports = router;