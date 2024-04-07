const cron = require('node-cron');
const moment = require('moment');
const { sendAppointmentReminder } = require('../services/sendEmailService');

const startHour = parseInt(process.env.WORKING_HOUR);
const closeHour = parseInt(process.env.CLOSING_HOUR);


// Cron job to run every 15 minutes between start and close hours
cron.schedule(`*/15 ${startHour-1}-${closeHour - 1} * * *`, () => {
    console.log('Running every 15 minutes between start and close hours');
    console.log(moment().tz('Asia/Kuala_Lumpur').format('YYYY-MM-DD HH:mm'));
    sendAppointmentReminder();
}, {timezone: 'Asia/Kuala_Lumpur'});


// cron.schedule(`* * * * *`, () => {
//     console.log('Running every 15 minutes between start and close hours');
//     console.log(moment().format('YYYY-MM-DD HH:mm'));
//     // Add your logic here
// });