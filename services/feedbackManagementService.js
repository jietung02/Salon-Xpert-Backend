const { connection } = require('../config/dbConnection');

const fetchAllFeedback = async (feedbackType) => {
    try {
        let table = null;
        if (feedbackType === 'service-specific') {
            table = 'SERVICESPECIFICFEEDBACK';
        }
        else if (feedbackType === 'general') {
            table = 'GENERALFEEDBACK';
        }
        else {
            return {
                status: 'error',
                message: 'No Feedback Type Found',
                data: null,
            }
        }


        let sql = null;

        if (table === 'SERVICESPECIFICFEEDBACK') {
            sql = "SELECT ssf.APPOINTMENT_ID AS appointmentId, c.CUSTOMER_GENDER AS gender, TIMESTAMPDIFF(YEAR, c.CUSTOMER_BIRTHDATE, CURDATE()) AS age, ssf.SERVICESPECIFICFEEDBACK_CATEGORY AS feedbackCategory, ssf.SERVICESPECIFICFEEDBACK_COMMENTS AS feedbackComments, ssf.SERVICESPECIFICFEEDBACK_OVERALL_SERVICE_RATING AS overallRating, ssf.SERVICESPECIFICFEEDBACK_CLEANINESS_RATING AS cleanlinessRating, ssf.SERVICESPECIFICFEEDBACK_SERVICE_SATISFACTION_RATING AS satisfactionWithResultRating, ssf.SERVICESPECIFICFEEDBACK_COMMUNICATION_RATING AS communicationRating, ssf.SERVICESPECIFICFEEDBACK_CREATED_DATE AS feedbackCreatedDate FROM SERVICESPECIFICFEEDBACK ssf INNER JOIN APPOINTMENT a ON ssf.APPOINTMENT_ID = a.APPOINTMENT_ID INNER JOIN CUSTOMER c ON a.CUSTOMER_ID = c.CUSTOMER_ID";
        }
        else if (table === 'GENERALFEEDBACK') {
            sql = "SELECT GENERALFEEDBACK_GENDER as gender, GENERALFEEDBACK_AGE AS age, GENERALFEEDBACK_CATEGORY AS feedbackCategory, GENERALFEEDBACK_COMMENTS AS feedbackComments, GENERALFEEDBACK_CREATED_DATE AS feedbackCreatedDate FROM GENERALFEEDBACK";
        }
        

        const [feeedbackResult] = await connection.execute(sql);

        if (feeedbackResult.length === 0) {
            return {
                status: 'error',
                message: 'No Feedback Found',
                data: null,
            }
        }

        return {
            status: 'success',
            message: 'Successfully Fetched All Feedback',
            data: feeedbackResult,
        }

    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = { fetchAllFeedback, };