const { connection } = require('../config/dbConnection');

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

module.exports = { fetchAllSpecialists, };