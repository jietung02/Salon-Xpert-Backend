const { connection } = require('../config/dbConnection');
const moment = require('moment');

const fetchAllSpecialists = async () => {
    try {

        const sql = "SELECT s.STAFF_ID AS staffId, s.STAFF_FULL_NAME AS staffName FROM staff s INNER JOIN role r ON s.ROLE_CODE = r.ROLE_CODE WHERE r.ROLE_IS_SERVICE_PROVIDER = 1;";

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

        return response;

    } catch (err) {
        throw new Error(err.message);
    }
}

const generateStaffPerformanceReport = async (selectedSpecialist) => {
    try {
        const sql = "SELECT s.STAFF_ID AS staffId, s.STAFF_FULL_NAME AS staffName, GROUP_CONCAT(svc.SERVICE_NAME) AS totalServices, (SELECT SUM(a2.APPOINTMENT_FINAL_PRICE) FROM appointment a2 WHERE a2.STAFF_ID = s.STAFF_ID && a2.APPOINTMENT_STATUS = 'Completed' GROUP BY a2.STAFF_ID) AS totalSalesGenerated, ROUND(AVG(ssf.SERVICESPECIFICFEEDBACK_SERVICE_SATISFACTION_RATING),2) AS averageClientSatisfactionRatings FROM staff s INNER JOIN appointment a ON s.STAFF_ID = a.STAFF_ID INNER JOIN appointmentservice apt ON a.APPOINTMENT_ID = apt.APPOINTMENT_ID INNER JOIN service svc ON apt.SERVICE_CODE = svc.SERVICE_CODE LEFT JOIN servicespecificfeedback ssf ON a.APPOINTMENT_ID = ssf.APPOINTMENT_ID  WHERE s.STAFF_ID = ? && a.APPOINTMENT_STATUS = 'Completed' GROUP BY s.STAFF_ID";

        const [performanceResult] = await connection.execute(sql, [selectedSpecialist]);

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
        const utcDateFrom = moment.utc(dateFrom).format();
        const utcDateTo = moment.utc(dateTo).add(1, 'day').format();

        const sql = "SELECT ROUND(AVG(SERVICESPECIFICFEEDBACK_OVERALL_SERVICE_RATING),2) AS averageOverallServiceRatings, ROUND(AVG(SERVICESPECIFICFEEDBACK_CLEANINESS_RATING),2) AS averageCleanlinessRatings, ROUND(AVG(SERVICESPECIFICFEEDBACK_SERVICE_SATISFACTION_RATING),2) AS averageServiceSatisfactionRatings, ROUND(AVG(SERVICESPECIFICFEEDBACK_COMMUNICATION_RATING),2) AS averageCommunicationRatings FROM servicespecificfeedback WHERE DATE(SERVICESPECIFICFEEDBACK_CREATED_DATE) >= ? && DATE(SERVICESPECIFICFEEDBACK_CREATED_DATE) <= ?";
        
        const [feedbackResult] = await connection.execute(sql, [utcDateFrom, utcDateTo]);
        
        if (feedbackResult.length === 0) {
            return {
                status: 'error',
                message: 'No Feedback & Ratings Found',
                data: null,
            }
        }
        const [feedback] = feedbackResult;

        //FETCH GROUP CATEGORY COMMENTS
        const sql2 = "SELECT SERVICESPECIFICFEEDBACK_CATEGORY AS category, GROUP_CONCAT(SERVICESPECIFICFEEDBACK_COMMENTS) AS comments FROM servicespecificfeedback WHERE DATE(SERVICESPECIFICFEEDBACK_CREATED_DATE) >= ? && DATE(SERVICESPECIFICFEEDBACK_CREATED_DATE) <= ? GROUP BY SERVICESPECIFICFEEDBACK_CATEGORY";
        const [commentsResult] = await connection.execute(sql2, [utcDateFrom, utcDateTo]);

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

        const dateRange = `${moment(dateFrom).tz('Asia/Kuala_Lumpur').format('DD/MM/YYYY')} - ${moment(dateTo).tz('Asia/Kuala_Lumpur').format('DD/MM/YYYY')}`;

        return {
            status: 'success',
            message: 'Successfully Fetched Feedback Data',
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
    try {

        const sql = "SELECT SUM(APPOINTMENT_FINAL_PRICE) AS totalRevenue FROM appointment WHERE APPOINTMENT_STATUS = 'Completed' && DATE(APPOINTMENT_END_DATE_TIME) >= ? && DATE(APPOINTMENT_END_DATE_TIME) <= ?";

        const [totalRevenueResult] = await connection.execute(sql, [dateFrom, dateTo]);

        if (totalRevenueResult.length === 0) {
            return {
                status: 'error',
                message: 'No Feedback & Ratings Found',
                data: null,
            }
        }

        const [{ totalRevenue }] = totalRevenueResult;


        //FETCH EACH SERVICE COUNT AND TOTAL REVENUE GENERATED (BASED PRICE)
        const sql2 = "SELECT s.SERVICE_NAME AS serviceName, COUNT(*) AS serviceCounts, (COUNT(*) * SERVICE_BASED_PRICE) AS totalGeneratedSales FROM appointment a INNER JOIN appointmentservice asvc ON a.APPOINTMENT_ID = asvc.APPOINTMENT_ID INNER JOIN service s ON asvc.SERVICE_CODE = s.SERVICE_CODE WHERE a.APPOINTMENT_STATUS = 'Completed' && DATE(APPOINTMENT_END_DATE_TIME) >= ? && DATE(APPOINTMENT_END_DATE_TIME) <= ? GROUP BY s.SERVICE_NAME";
        const [serviceRevenueResult] = await connection.execute(sql2, [dateFrom, dateTo]);

        if (serviceRevenueResult.length === 0) {
            return {
                status: 'error',
                message: 'No Service Revenue Generated Found',
                data: null,
            }
        }

        //GET TIMESLOT REVENUE DISTRIBUTION
        const sql3 = "SELECT timeSlotTable.timeSlot, COALESCE(SUM(CASE WHEN APPOINTMENT_STATUS = 'Completed' && DATE(APPOINTMENT_END_DATE_TIME) >= ? && DATE(APPOINTMENT_END_DATE_TIME) <= ? THEN APPOINTMENT_FINAL_PRICE ELSE 0 END), 0) AS revenue FROM (SELECT 'Morning' AS timeSlot UNION ALL SELECT 'Afternoon' UNION ALL SELECT 'Evening') AS timeSlotTable LEFT JOIN appointment ON CASE WHEN HOUR(APPOINTMENT_START_DATE_TIME) BETWEEN 6 AND 11 THEN 'Morning' WHEN HOUR(APPOINTMENT_START_DATE_TIME) BETWEEN 12 AND 17 THEN 'Afternoon' WHEN HOUR(APPOINTMENT_START_DATE_TIME) BETWEEN 18 AND 23 THEN 'Evening' END = timeSlotTable.timeSlot GROUP BY timeSlotTable.timeSlot";

        const [timeSlotsResult] = await connection.execute(sql3, [dateFrom, dateTo]);


        if (timeSlotsResult.length === 0) {
            return {
                status: 'error',
                message: 'No TimeSlots Revenue Distribution Found',
                data: null,
            }
        }

        //FETCH BOOKING TRENDS

        let sql4 = null;
        if (process.env.NODE_ENV === 'production') {
            sql4 = "SELECT COUNT(CASE WHEN APPOINTMENT_STATUS = 'Completed' THEN 1 END) totalCompletedAppointments, COUNT(CASE WHEN APPOINTMENT_STATUS = 'Cancelled' || (APPOINTMENT_STATUS = 'Scheduled' && DATE(APPOINTMENT_START_DATE_TIME) < DATE(CONVERT_TZ(NOW(), 'UTC', 'Asia/Kuala_Lumpur'))) THEN 1 END) cancelledAppointments, ROUND((COUNT(CASE WHEN APPOINTMENT_STATUS = 'Cancelled' || (APPOINTMENT_STATUS = 'Scheduled' && DATE(APPOINTMENT_START_DATE_TIME) < DATE(CONVERT_TZ(NOW(), 'UTC', 'Asia/Kuala_Lumpur'))) THEN 1 END) / COUNT(CASE WHEN APPOINTMENT_STATUS = 'Completed' THEN 1 END)) * 100, 2) AS cancellationRate FROM appointment WHERE DATE(APPOINTMENT_END_DATE_TIME) >= ? && DATE(APPOINTMENT_END_DATE_TIME) <= ?"
        }
        else {
            sql4 = "SELECT COUNT(CASE WHEN APPOINTMENT_STATUS = 'Completed' THEN 1 END) totalCompletedAppointments, COUNT(CASE WHEN APPOINTMENT_STATUS = 'Cancelled' || (APPOINTMENT_STATUS = 'Scheduled' && DATE(APPOINTMENT_START_DATE_TIME) < DATE(NOW())) THEN 1 END) cancelledAppointments, ROUND((COUNT(CASE WHEN APPOINTMENT_STATUS = 'Cancelled' || (APPOINTMENT_STATUS = 'Scheduled' && DATE(APPOINTMENT_START_DATE_TIME) < DATE(NOW())) THEN 1 END) / COUNT(CASE WHEN APPOINTMENT_STATUS = 'Completed' THEN 1 END)) * 100, 2) AS cancellationRate FROM appointment WHERE DATE(APPOINTMENT_END_DATE_TIME) >= ? && DATE(APPOINTMENT_END_DATE_TIME) <= ?";

        }

        const [bookingTrendsResult] = await connection.execute(sql4, [dateFrom, dateTo]);

        if (bookingTrendsResult.length === 0) {
            return {
                status: 'error',
                message: 'No Booking Trends Found',
                data: null,
            }
        }

        const dateRange = `${moment(dateFrom).tz('Asia/Kuala_Lumpur').format('DD/MM/YYYY')} - ${moment(dateTo).tz('Asia/Kuala_Lumpur').format('DD/MM/YYYY')}`;

        return {
            status: 'success',
            message: 'Successfully Fetch Revenue Report Data',
            data: {
                revenueReport: {
                    totalRevenue,
                    dateRange,
                    services: serviceRevenueResult,
                    timeSlot: timeSlotsResult,
                    bookingTrends: bookingTrendsResult,
                }
            }
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchAllSpecialists, generateSelectedReport, };