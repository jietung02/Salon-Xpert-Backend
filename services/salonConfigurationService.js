const { connection } = require('../config/dbConnection');

const fetchAllSalonServices = async () => {
    try {
        const sql = "SELECT SERVICE_CODE AS serviceCode, SERVICE_NAME AS serviceName, SERVICE_DURATION AS serviceDuration, SERVICE_BASED_PRICE AS serviceBasedPrice FROM SERVICE";

        const [serviceResult] = await connection.execute(sql);

        if (serviceResult === 0) {
            return {
                status: 'error',
                message: 'No Services Found',
                data: null,
            }
        }
        const servicesData = serviceResult.map((value) => {
            return [value.serviceCode, value.serviceName, value.serviceDuration, value.serviceBasedPrice];
        })

        return {
            status: 'success',
            message: 'Successfully Fetched All Services',
            data: {
                headers: ['Service Code', 'Service Name', 'Service Duration', 'Service Based Price'],
                servicesData: servicesData
            }
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const createNewService = async (serviceDetails) => {
    try {
        const { serviceCode, serviceName, serviceDuration, serviceBasedPrice } = serviceDetails;
        const sql = "INSERT INTO SERVICE (SERVICE_CODE, SERVICE_NAME, SERVICE_DURATION, SERVICE_BASED_PRICE) VALUES (?, ?, ?, ?)";

        const [newServiceResult] = await connection.execute(sql, [serviceCode, serviceName, serviceDuration, serviceBasedPrice]);
        const rowAffected = newServiceResult.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Insert into Service Table');
        }

        return {
            status: 'success',
            message: 'Successfully Created New Service',
        }

    } catch (err) {
        throw new Error(err.message);
    }
};

const editExistingService = async (serviceDetails) => {
    try {
        const { serviceCode, serviceName, serviceDuration, serviceBasedPrice } = serviceDetails;
        const sql = "UPDATE SERVICE SET SERVICE_CODE = ?, SERVICE_NAME = ?, SERVICE_DURATION = ?, SERVICE_BASED_PRICE = ? WHERE SERVICE_CODE = ?";

        const [newServiceResult] = await connection.execute(sql, [serviceCode, serviceName, serviceDuration, serviceBasedPrice, serviceCode]);
        const rowAffected = newServiceResult.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Update Service Table');
        }

        return {
            status: 'success',
            message: 'Successfully Updated Service',
        }

    } catch (err) {
        throw new Error(err.message);
    }
};

const deleteExistingService = async (serviceCode) => {
    try {
        const sql = "DELETE FROM SERVICE WHERE SERVICE_CODE = ?";

        const [deleteServiceResult] = await connection.execute(sql, [serviceCode]);
        const rowAffected = deleteServiceResult.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Delete Service from Service Table');
        }

        return {
            status: 'success',
            message: 'Successfully Deleted the Service',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAllStaffProfiles = async () => {
    try {
        const sql = "SELECT s.STAFF_ID AS staffId, u.USER_USERNAME AS staffUsername, s.STAFF_FULL_NAME AS staffName, r.ROLE_NAME AS staffRoleName, s.ROLE_CODE AS staffRoleCode, GROUP_CONCAT(svc.SERVICE_NAME SEPARATOR ', ') AS servicesProvided,GROUP_CONCAT(svc.SERVICE_CODE SEPARATOR ', ') AS serviceCodes, u.USER_EMAIL AS staffEmail, s.STAFF_CONTACT_NUMBER AS staffContact, s.STAFF_BIO AS staffBio FROM STAFF s INNER JOIN USER u ON s.USER_ID = u.USER_ID INNER JOIN ROLE r ON s.ROLE_CODE = r.ROLE_CODE LEFT JOIN STAFFSPECIALTY ss ON s.STAFF_ID = ss.STAFF_ID LEFT JOIN SERVICE svc ON ss.SERVICE_CODE = svc.SERVICE_CODE  GROUP BY s.STAFF_ID";


        const [serviceResult] = await connection.execute(sql);

        if (serviceResult === 0) {
            return {
                status: 'error',
                message: 'No Profiles Found',
                data: null,
                additionalData: null,
            }
        }

        const servicesData = serviceResult.map((value) => {
            return [value.staffId, value.staffUsername, value.staffName, value.staffRoleName, value.servicesProvided, value.staffEmail, value.staffContact, value.staffBio];
        });

        const additionalData = serviceResult.map((value) => {
            return {
                staffId: value.staffId,
                staffUsername: value.staffUsername,
                staffName: value.staffName,
                staffRoleCode: value.staffRoleCode,
                serviceCodes: value.serviceCodes,
                staffEmail: value.staffEmail,
                staffContact: value.staffContact,
                staffBio: value.staffBio,
            }
        });


        return {
            status: 'success',
            message: 'Successfully Fetched All Staff Profiles',
            data: {
                headers: ['Staff ID', 'Username', 'Name', 'Role', 'Services Provided', 'Email', 'Contact Number', 'Bio'],
                staffProfilesData: servicesData,
                additionalData: additionalData,

            }
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAllAvailableRoles = async () => {
    try {
        const sql = "SELECT ROLE_CODE AS roleCode, ROLE_NAME AS roleName, ROLE_IS_SERVICE_PROVIDER AS roleIsServiceProvider FROM ROLE";

        const [rolesResult] = await connection.execute(sql);
        console.log(rolesResult)
        if (rolesResult === 0) {
            return {
                status: 'error',
                message: 'No Roles Found',
                data: null,
            }
        }

        return {
            status: 'success',
            message: 'Successfully Fetched All Roles',
            data: rolesResult,
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAllAvailableServices = async () => {
    try {
        const sql = "SELECT SERVICE_CODE AS serviceCode, SERVICE_NAME AS serviceName FROM SERVICE";

        const [servicesResult] = await connection.execute(sql);

        if (servicesResult === 0) {
            return {
                status: 'error',
                message: 'No Services Found',
                data: null,
            }
        }

        return {
            status: 'success',
            message: 'Successfully Fetched All Services',
            data: servicesResult,
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const createNewStaffProfile = async (profileDetails) => {
    //register using auth service for user table,

    // register staff, check if selected role is service provider, then generate a new calendar id
}
module.exports = { fetchAllSalonServices, createNewService, editExistingService, deleteExistingService, fetchAllStaffProfiles, fetchAllAvailableRoles, fetchAllAvailableServices, createNewStaffProfile,};