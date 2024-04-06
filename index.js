const express = require('express');
const cors = require('cors');
const { connection } = require('./config/dbConnection');

const usersRouter = require('./routes/users');
const customerRouter = require('./routes/customers');
const dashboardRouter = require('./routes/dashboard');
const salonConfigurationsRouter = require('./routes/salonConfigurations');
const userManagementRouter = require('./routes/userManagement');
const reportsRouter = require('./routes/reports');
const feedbackManagementRouter = require('./routes/feedbackManagement');
const serviceManagementRouter = require('./routes/serviceManagement');
const { sendPaymentEmail } = require('./services/sendEmailService');
const { sendAppointmentReminder } = require('./services/sendEmailService');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', usersRouter);
app.use('/customers', customerRouter);
app.use('/dashboard', dashboardRouter);
app.use('/salon-configurations', salonConfigurationsRouter);
app.use('/user-management', userManagementRouter);
app.use('/reports', reportsRouter);
app.use('/feedback-management', feedbackManagementRouter)
app.use('/service-management', serviceManagementRouter)

app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
    console.log(`Connected to the database successfully!`);
    // sendPaymentEmail('Jie', 'reminders@salon-xpert.pro','testlink');
    // sendAppointmentReminder();
});



//Create a middleware function to check the user id from the request body the user pass in, and check their accessible routes

// npm run dev