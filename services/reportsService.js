const { connection } = require('../config/dbConnection');
const moment = require('moment');

const fetchAllSpecialists = async () => {
    try {

        const sql = "SELECT s.STAFF_ID AS staffId, s.STAFF_FULL_NAME AS staffName FROM STAFF s INNER JOIN ROLE r ON s.ROLE_CODE = r.ROLE_CODE WHERE r.ROLE_IS_SERVICE_PROVIDER = 1;";

        const [specialistsResult] = await connection.execute(sql);

        if (specialistsResult.length === 0) {
            return {
                status: 'error',
                message: 'No Specialists Found',
                data: null,
            }
        }

        return {
            status: 'success',
            message: 'Successfully Fetched All Specialists',
            data: specialistsResult,
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const generateSelectedReport = async (reportDetails) => {
    try {
        const { selectedReport, selectedSpecialist, dateFrom, dateTo, } = reportDetails;

        let response = null;
        if (selectedReport === 'staffPerformanceReport') {
            response = await generateStaffPerformanceReport(selectedSpecialist);
        }
        else if (selectedReport === 'feedbackReport') {
            response = await generateFeedbackReport(dateFrom, dateTo);
        }
        else if (selectedReport === 'revenueReport') {
            response = await generateRevenueReport(dateFrom, dateTo);
        }
        else {
            throw new Error('Selected Report Not Exists')
        }

        if (response.status === 'error') {

        }

        return response;

    } catch (err) {
        throw new Error(err.message);
    }
}

const generateStaffPerformanceReport = async (selectedSpecialist) => {
    try {
        const sql = "SELECT s.STAFF_ID AS staffId, s.STAFF_FULL_NAME AS staffName, GROUP_CONCAT(svc.SERVICE_NAME) AS totalServices, (SELECT SUM(a2.APPOINTMENT_FINAL_PRICE) FROM APPOINTMENT a2 WHERE a2.STAFF_ID = s.STAFF_ID && a2.APPOINTMENT_STATUS = 'Completed' GROUP BY a2.STAFF_ID) AS totalSalesGenerated, AVG(ssf.SERVICESPECIFICFEEDBACK_SERVICE_SATISFACTION_RATING) AS averageClientSatisfactionRatings FROM STAFF s INNER JOIN APPOINTMENT a ON s.STAFF_ID = a.STAFF_ID INNER JOIN APPOINTMENTSERVICE apt ON a.APPOINTMENT_ID = apt.APPOINTMENT_ID INNER JOIN SERVICE svc ON apt.SERVICE_CODE = svc.SERVICE_CODE LEFT JOIN SERVICESPECIFICFEEDBACK ssf ON a.APPOINTMENT_ID = ssf.APPOINTMENT_ID  WHERE s.STAFF_ID = ? && a.APPOINTMENT_STATUS = 'Completed' GROUP BY s.STAFF_ID";

        const [performanceResult] = await connection.execute(sql, [selectedSpecialist]);
        console.log(performanceResult)
        if (performanceResult.length === 0) {
            return {
                status: 'error',
                message: 'No Appointments Found',
                data: null,
            }
        }
        const [staffPerformance] = performanceResult;

        const allServices = staffPerformance.totalServices.split(',');
        let serviceCounts = {};
        allServices.forEach(service => {
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });

        const uniqueServices = Object.keys(serviceCounts).map(service => ({
            service,
            count: serviceCounts[service]
        }));
        console.log(uniqueServices)
        const reformat = {
            ...staffPerformance,
            totalServices: uniqueServices,
        }


        return {
            status: 'success',
            message: 'Successfully Fetched Staff Performance Data',
            data: {
                staffPerformance: reformat,
            }
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const generateFeedbackReport = async (dateFrom, dateTo) => {
    try {
        const sql = "SELECT AVG(SERVICESPECIFICFEEDBACK_OVERALL_SERVICE_RATING) AS averageOverallServiceRatings, AVG(SERVICESPECIFICFEEDBACK_CLEANINESS_RATING) AS averageCleanlinessRatings, AVG(SERVICESPECIFICFEEDBACK_SERVICE_SATISFACTION_RATING) AS averageServiceSatisfactionRatings, AVG(SERVICESPECIFICFEEDBACK_COMMUNICATION_RATING) AS averageCommunicationRatings FROM SERVICESPECIFICFEEDBACK WHERE DATE(SERVICESPECIFICFEEDBACK_CREATED_DATE) >= ? && DATE(SERVICESPECIFICFEEDBACK_CREATED_DATE) <= ?";

        const [feedbackResult] = await connection.execute(sql, [dateFrom, dateTo]);

        if (feedbackResult.length === 0) {
            return {
                status: 'error',
                message: 'No Feedback & Ratings Found',
                data: null,
            }
        }
        const [feedback] = feedbackResult;

        //FETCH GROUP CATEGORY COMMENTS
        const sql2 = "SELECT SERVICESPECIFICFEEDBACK_CATEGORY AS category, GROUP_CONCAT(SERVICESPECIFICFEEDBACK_COMMENTS) AS comments FROM SERVICESPECIFICFEEDBACK WHERE DATE(SERVICESPECIFICFEEDBACK_CREATED_DATE) >= ? && DATE(SERVICESPECIFICFEEDBACK_CREATED_DATE) <= ? GROUP BY SERVICESPECIFICFEEDBACK_CATEGORY";
        const [commentsResult] = await connection.execute(sql2, [dateFrom, dateTo]);

        if (commentsResult.length === 0) {
            return {
                status: 'error',
                message: 'No Feedback Comments Found',
                data: null,
            }
        }
        const reformat = commentsResult.map((value) => {
            const comments = value.comments.split(',');
            if (value.category === 'Praise') {
                return {
                    category: 'Praise and Positive Feedback',
                    comments: comments,
                }
            }
            else if (value.category === 'Improvement') {
                return {
                    category: 'Suggestions for Improvement',
                    comments: comments,
                }
            }
            else if (value.category === 'Complaint') {
                return {
                    category: 'Complaints and Concerns',
                    comments: comments,
                }
            }
        })

        const dateRange = `${moment(dateFrom).format('DD/MM/YYYY')} - ${moment(dateTo).format('DD/MM/YYYY')}`;

        return {
            status: 'success',
            message: 'Successfully Fetched Staff Performance Data',
            data: {
                feedbackRatings: { ...feedback, dateRange },
                comments: reformat,
            }
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const generateRevenueReport = async (dateFrom, dateTo) => {

}

module.exports = { fetchAllSpecialists, generateSelectedReport, };