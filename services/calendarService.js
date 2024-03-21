const { response } = require('express');
const { google, calendar_v3 } = require('googleapis');

const scopes = process.env.GOOGLE_SCOPES;
const scopesArr = scopes.split(',');
const private_key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
const client_email = process.env.GOOGLE_CLIENT_EMAIL;
const project_number = process.env.GOOGLE_PROJECT_NUMBER;
const calendar_id = process.env.GOOGLE_CALENDAR_ID;

const jwtClient = new google.auth.JWT(
    client_email,
    null,
    private_key,
    scopesArr,
    
);

// const jwtClient = new google.auth.JWT({
//     email:client_email,
//     key:private_key,
//     scopes: scopesArr,
//     subject: client_email,
    
// });
// const jwtClient = new google.auth.GoogleAuth({
//     keyFile: "config/calendarService.json",
//     scopes: [
//       'https://www.googleapis.com/auth/calendar',
//       'https://www.googleapis.com/auth/calendar.events'
//     ],
//     clientOptions: {
//       subject: client_email
//     },
// });
const calendar = google.calendar({
    version: 'v3',
    project: project_number,
    auth: jwtClient
});


const getCalendar = async () => {

    calendar.events.list({
        calendarId: calendar_id,
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (error, result) => {
        if (error) {
            console.log('in')
            console.log(JSON.stringify({ error: error }));
        } else {
            if (result.data.items.length) {
                console.log(result.data.items);
            } else {
                console.log(JSON.stringify({ message: 'No upcoming events found.' }));
            }
        }
    });

}

const createNewCalendar = async (staffUsername) => {
    try {

        const response = await calendar.calendars.insert({
            requestBody: {
                summary: staffUsername,
                timeZone: 'Asia/Kuala_Lumpur',
            }
        })

        if (response.status !== 200) {
            throw new Error('Failed to Create a New Staff Calendar');
        }

        const calId = response.data.id;

        const response2 = await calendar.acl.insert({
            calendarId: calId,
            requestBody: {
                role: 'owner',
                scope: {
                    type: 'user',
                    value: process.env.MANAGER_EMAIL
                }

            }

        })
        console.log('Access Control Added');
        if (response2.status !== 200) {
            throw new Error('Failed to Share the Calendar with the Manager');
        }
        return {
            status: 'success',
            message: 'Successfully Created a New Calendar',
            data: {
                calendarId: calId,
            }
        }



    } catch (err) {
        throw new Error(err.message);
    }

}

//GET ALL EVENTS DURING THE DAY
const getEvents = async (calId) => {
    try {
        const today = new Date(2024, 2, 4);
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        //modify here fetch event on the same date and verify  maybe allow 10 minutes overlap
        const response = await calendar.events.list({
            // '2839e1657035e3251bbacc4bf5359687038c6dda9eef0cd8b55b3538a93c0339@group.calendar.google.com'
            calendarId: calId,
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            // timeZone: 'Asia/Kuala_Lumpur',

        })

        if (response.status !== 200) {
            throw new Error('Error Getting Events');
        }
        return response.data.items;
    } catch (error) {
        console.log(error.message)
    }

}

const getSpecialistEvents = async (calId, date) => {
    try {
        console.log(date)
        const startDate = new Date(date);
        const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
        const endOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59, 59);
        //modify here fetch event on the same date and verify  maybe allow 10 minutes overlap
        const response = await calendar.events.list({
            // '2839e1657035e3251bbacc4bf5359687038c6dda9eef0cd8b55b3538a93c0339@group.calendar.google.com'
            calendarId: calId,
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            // timeZone: 'Asia/Kuala_Lumpur',

        })

        if (response.status !== 200) {
            throw new Error('Error Getting Events');
        }
        return response.data.items;
    } catch (error) {
        console.log(error.message)
    }

}

const createNewEventinStaffCalendar = async (eventDetails) => {
    try {
        console.log(eventDetails)
        const { calendarId: calId, appointmentId, name, email: emailAddress, startDateTime: selectedTime, endDateTime: selectedEndTime, servicesName, specialist } = eventDetails;

        const startDateTime = new Date(selectedTime);
        const endDateTime = new Date(selectedEndTime);

        const response = await calendar.events.insert({
            calendarId: calId,
            sendUpdates: 'all',
            requestBody: {
                id: appointmentId,
                summary: `Appointment with ${name}`,
                description: `Schedule Event for ${servicesName} with ${specialist} (Staff).`,
                start: {
                    dateTime: startDateTime,
                    timeZone: 'Asia/Kuala_Lumpur',
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: 'Asia/Kuala_Lumpur',
                },
                // attendees: [
                //     {
                //         email: emailAddress,
                //         displayName: name,

                //     }
                // ],
                reminders: {
                    useDefault: false,
                    overrides: [{
                        method: 'email',
                        minutes: 30,
                    }],
                }

            }
        });
        console.log(response)

        if (response.status !== 200) {
            throw new Error('Failed to Create New Event')
        }

        return;

    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}



module.exports = { getCalendar, createNewCalendar, getEvents, getSpecialistEvents, createNewEventinStaffCalendar, };
