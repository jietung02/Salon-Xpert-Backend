const { connection } = require('../config/dbConnection');

const fetchAllFeedback = async () => {
    try {
        const sql = "SELECT ssf.APPOINTMENT_ID AS appointmentId, COALESCE(c.CUSTOMER_GENDER, g.GUEST_GENDER) AS gender, CASE WHEN c.CUSTOMER_ID IS NOT NULL THEN TIMESTAMPDIFF(YEAR, c.CUSTOMER_BIRTHDATE, CURDATE())ELSE g.GUEST_AGE END AS age, ssf.SERVICESPECIFICFEEDBACK_CATEGORY AS feedbackCategory, ssf.SERVICESPECIFICFEEDBACK_COMMENTS AS feedbackComments, ssf.SERVICESPECIFICFEEDBACK_OVERALL_SERVICE_RATING AS overallRating, ssf.SERVICESPECIFICFEEDBACK_CLEANINESS_RATING AS cleanlinessRating, ssf.SERVICESPECIFICFEEDBACK_SERVICE_SATISFACTION_RATING AS satisfactionWithResultRating, ssf.SERVICESPECIFICFEEDBACK_COMMUNICATION_RATING AS communicationRating, ssf.SERVICESPECIFICFEEDBACK_CREATED_DATE AS feedbackCreatedDate FROM servicespecificfeedback ssf INNER JOIN appointment a ON ssf.APPOINTMENT_ID = a.APPOINTMENT_ID LEFT JOIN customer c ON a.CUSTOMER_ID = c.CUSTOMER_ID LEFT JOIN guest g ON a.GUEST_ID = g.GUEST_ID";

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