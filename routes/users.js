const express = require('express');

const router = express.Router();

const { authentication, getGuestData } = require('../controllers/userController');

const userData = {
    isAuthenticated: true,
    username: 'Jie',
    role: 'staff',
    permissions: [
        {
            rolePermission: 'Service Management',
            functions: [{ name: 'Update Service Price', route: '/staff/update-service-price' }, { name: 'View Own Schedule', route: '/staff/view-schedule' }],
        },
        {
            rolePermission: 'Dashboard',
            functions: [{ name: 'Dashboard', route: '/staff' }, { name: 'View all Staff Schedules', route: '/staff/staff-schedules' }],
        },
        {
            rolePermission: 'User Management',
            functions: [{ name: 'Manage Roles', route: '/staff/roles' }, { name: 'Access Control', route: '/staff/access-control' }],
        },

    ],
    token: 'JWT token',
    isLoggedOut: false,
};


router.post('/login', async (req, res) => {


    //if the user role is customer, only return the customer category
    //check if the user role is staff, then return role permission name along with each role permission features, like above schema

    try {
        const { username, password } = req.body;
        //Authenticate user
        const authData = await authentication(username, password);

        res.status(200).json(authData)
    } catch (err) {
        res.status(400).json({error: err.message});
    }
})

//Guest Mode Login
router.get('/guest', async (req, res) => {

    try {
      //Authenticate user
      const guestData = await getGuestData();
    
      return res.status(200).json(guestData);
    } catch (err) {
      console.log(err.message)
      return res.status(500).json({ error: err.message });
    }
  });


module.exports = router;
