const { SESClient, sendEmail, SendEmailCommand } = require('@aws-sdk/client-ses');
const { connection } = require('../config/dbConnection');
const moment = require('moment');

const smtpUsername = process.env.AWS_SES_ACCESS_KEY;
const secretKey = process.env.AWS_SES_SECRET_KEY;
const from = process.env.AWS_REGION;


const client = new SESClient({ region: from, credentials: { accessKeyId: smtpUsername, secretAccessKey: secretKey }, });

const sendPaymentEmail = async (name, recipientEmail, paymentLink) => {
    try {
        let input = {
            Source: 'payments@salon-xpert.pro',
            Destination: {
                ToAddresses: [
                    recipientEmail,
                ],
            },
            ReplyToAddresses: [],
            Message: {
                Subject: {
                    Charset: 'UTF-8',
                    Data: `Thank You for Your Appointment! Here's Your Payment Link`,
                },

                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `<h2>Dear ${name},</h2>
                        <p>We wanted to express our gratitude for booking an appointment with us at SalonXpert. We truly appreciate your business and look forward to providing you with an exceptional experience.</p><br />
                        <p>To complete your booking process, please find the updated final service price for your appointment along with the payment link below:</p> <p><a href="${paymentLink}">Payment Link</a></p><br />
                        <p>Looking forward to seeing you at SalonXpert!</p> <br /><br /><p>Best regards,</p>
                        <p>SalonXpert</p>`,
                    },
                },
            },
        }
        const command = new SendEmailCommand(input);
        const response = await client.send(command);
        
        if (response.$metadata.httpStatusCode !== 200) {
            console.error(`Failed to Send Email to ${recipientEmail}`);
        }

    } catch (err) {
        throw new Error(err.message);
    }

};

const sendAppointmentReminder = async () => {

    try {
        let sql = null;

        if (process.env.NODE_ENV === 'production') {
            sql = "SELECT a.APPOINTMENT_ID AS appointmentId, u.USER_EMAIL AS email, COALESCE(c.CUSTOMER_FULL_NAME, g.GUEST_FULL_NAME) AS name, a.APPOINTMENT_START_DATE_TIME AS startDateTime FROM appointment a LEFT JOIN guest g ON a.CUSTOMER_ID IS NULL AND a.GUEST_ID = g.GUEST_ID LEFT JOIN customer c ON a.CUSTOMER_ID IS NOT NULL AND a.CUSTOMER_ID = c.CUSTOMER_ID LEFT JOIN user u ON COALESCE(c.USER_ID, g.USER_ID) = u.USER_ID WHERE a.APPOINTMENT_START_DATE_TIME BETWEEN CONVERT_TZ(NOW(), 'UTC', 'Asia/Kuala_Lumpur') + INTERVAL 20 MINUTE AND CONVERT_TZ(NOW(), 'UTC', 'Asia/Kuala_Lumpur') + INTERVAL 30 MINUTE AND a.APPOINTMENT_STATUS = 'Scheduled'";
        }
        else {
            sql = "SELECT a.APPOINTMENT_ID AS appointmentId, u.USER_EMAIL AS email, COALESCE(c.CUSTOMER_FULL_NAME, g.GUEST_FULL_NAME) AS name, a.APPOINTMENT_START_DATE_TIME AS startDateTime FROM appointment a LEFT JOIN guest g ON a.CUSTOMER_ID IS NULL AND a.GUEST_ID = g.GUEST_ID LEFT JOIN customer c ON a.CUSTOMER_ID IS NOT NULL AND a.CUSTOMER_ID = c.CUSTOMER_ID LEFT JOIN user u ON COALESCE(c.USER_ID, g.USER_ID) = u.USER_ID WHERE a.APPOINTMENT_START_DATE_TIME BETWEEN NOW() + INTERVAL 20 MINUTE AND NOW() + INTERVAL 30 MINUTE AND a.APPOINTMENT_STATUS = 'Scheduled'";
        }

        const [result] = await connection.execute(sql);
        console.log(result)

        if (result.length > 0) {

            for (const appointment of result) {
                const { appointmentId, email, name, startDateTime } = appointment;
                let formattedDateTime = moment(startDateTime);
                let input = {
                    Source: 'reminders@salon-xpert.pro',
                    Destination: {
                        ToAddresses: [
                            email,
                        ],
                    },
                    ReplyToAddresses: [],
                    Message: {
                        Subject: {
                            Charset: 'UTF-8',
                            Data: `Reminder: Your Appointment with SalonXpert`,
                        },
                        Body: {
                            Html: {
                                Charset: 'UTF-8',
                                Data: `<h2>Dear ${name},</h2>
                                <p>This is a friendly reminder about your upcoming appointment with SalonXpert:</p>
                                <p><strong>Date & Time:</strong> ${formattedDateTime}</p>
                                <p>Please remember to arrive on time for your appointment.</p>
                                <p>If you need to make any changes or have any questions, feel free to contact us.</p>
                                <p>We're looking forward to seeing you soon!</p>
                                <br>
                                <p>Best regards,</p>
                                <p>SalonXpert</p>`,
                            },
                        },
                    },
                }
                const command = new SendEmailCommand(input);
                const response = await client.send(command);

                if (response.$metadata.httpStatusCode !== 200) {
                    console.error(`Failed to Send Email for Appointment ID ${appointmentId}`);
                }
            }

        }
        else {
            console.log('No Upcoming Appointment in 30 minutes');
        }
    } catch (error) {
        console.error('Failed to Send Email - Error : ' + error.message);
    }

}

module.exports = { sendPaymentEmail, sendAppointmentReminder };




