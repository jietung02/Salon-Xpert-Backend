const cron = require('node-cron');
const moment = require('moment-timezone');
const { sendAppointmentReminder } = require('../services/sendEmailService');

const startHour = parseInt(process.env.WORKING_HOUR);
const closeHour = parseInt(process.env.CLOSING_HOUR);

const scheduledTimes = [];

// Cron job to run every 15 minutes between start and close hours
cron.schedule(`*/15 ${startHour-1}-${closeHour - 1} * * *`, () => {
    const scheduledTime = moment().tz('Asia/Kuala_Lumpur').format('YYYY-MM-DD HH:mm');
    scheduledTimes.push(scheduledTime);
    console.log(`Running every 15 minutes ${moment().tz('Asia/Kuala_Lumpur').format('YYYY-MM-DD HH:mm')}`);
    sendAppointmentReminder();
    console.log('All scheduled times:', scheduledTimes);
}, {timezone: 'Asia/Kuala_Lumpur'});

