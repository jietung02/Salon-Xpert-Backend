const bcrypt = require('bcryptjs');
const { connection } = require('../config/dbConnection');
const { userRegistration } = require('../services/authService');
const { createNewCalendar } = require('../services/calendarService');
const { reformatAgeCategories } = require('../utils/utils');

const fetchAllSalonServices = async () => {
    try {
        const sql = "SELECT SERVICE_CODE AS serviceCode, SERVICE_NAME AS serviceName, SERVICE_DURATION AS serviceDuration, SERVICE_BASED_PRICE AS serviceBasedPrice FROM SERVICE ORDER BY serviceName";

        const [serviceResult] = await connection.execute(sql);

        if (serviceResult.length === 0) {
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

        const sql = "SELECT s.STAFF_ID AS staffId, u.USER_USERNAME AS staffUsername, s.STAFF_FULL_NAME AS staffName, r.ROLE_NAME AS staffRoleName, s.ROLE_CODE AS staffRoleCode, GROUP_CONCAT(svc.SERVICE_NAME SEPARATOR ', ') AS servicesProvided,GROUP_CONCAT(svc.SERVICE_CODE SEPARATOR ', ') AS serviceCodes, u.USER_EMAIL AS staffEmail, s.STAFF_CONTACT_NUMBER AS staffContact, s.STAFF_BIO AS staffBio FROM STAFF s INNER JOIN USER u ON s.USER_ID = u.USER_ID LEFT JOIN ROLE r ON s.ROLE_CODE = r.ROLE_CODE LEFT JOIN STAFFSPECIALTY ss ON s.STAFF_ID = ss.STAFF_ID LEFT JOIN SERVICE svc ON ss.SERVICE_CODE = svc.SERVICE_CODE GROUP BY staffId ORDER BY staffUsername";


        const [serviceResult] = await connection.execute(sql);

        if (serviceResult.length === 0) {
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
        if (rolesResult.length === 0) {
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
        const sql = "SELECT SERVICE_CODE AS serviceCode, SERVICE_NAME AS serviceName FROM SERVICE ORDER BY SERVICE_NAME";

        const [servicesResult] = await connection.execute(sql);

        if (servicesResult.length === 0) {
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

    try {
        const response = await staffRegistration(profileDetails);
        return response;
        // register staff, check if selected role is service provider, then generate a new calendar id
    } catch (err) {
        throw new Error(err.message);
    }

}

const staffRegistration = async (profileDetails) => {
    try {
        const hashedPassword = await hashPassword(profileDetails.staffPassword);
        const hashStaffData = { ...profileDetails, staffPassword: hashedPassword };
        const response = await createUser(hashStaffData);
        return response;

    } catch (err) {
        throw new Error(err.message);
    }
};


const createUser = async (profileDetails) => {

    try {
        await connection.query('START TRANSACTION');

        const { staffName, staffEmail, staffUsername, staffPassword, staffContact, staffRole, servicesProvided, staffBio } = profileDetails;

        //INSERT INTO USER TABLE
        const sql = "INSERT INTO USER (USER_USERNAME, USER_PASSWORD_HASH, USER_EMAIL, USER_ROLE) VALUES (?, ?, ?, ?)";
        const [userResult] = await connection.execute(sql, [staffUsername, staffPassword, staffEmail, 'staff']);
        if (userResult.affectedRows <= 0 || userResult.insertId === null) {
            throw new Error('Failed to Insert into User Table');
        }
        const newUserId = userResult.insertId;



        //CHECK ROLE CODE WHETHER IS IT SERVICE PROVIDER
        const sql3 = "SELECT ROLE_IS_SERVICE_PROVIDER AS isServiceProvider FROM ROLE WHERE ROLE_CODE = ?";
        const [serviceProviderResult] = await connection.execute(sql3, [staffRole]);

        if (!serviceProviderResult || serviceProviderResult.length === 0 || serviceProviderResult[0].isServiceProvider === undefined) {
            throw new Error('Failed to Get Is Service Provider Result');
        }
        const [{ isServiceProvider }] = serviceProviderResult;

        //GENERATE CALENDAR ID
        let calendarId = null;
        if (isServiceProvider === 1) {
            const response = await createNewCalendar(profileDetails.staffUsername);
            calendarId = response.data.calendarId;
        }

        //INSERT INTO STAFF TABLE
        const sql2 = "INSERT INTO STAFF (USER_ID, STAFF_FULL_NAME, ROLE_CODE, STAFF_CONTACT_NUMBER, STAFF_BIO, STAFF_CALENDAR_ID) VALUES (?, ?, ?, ?, ?, ?)";
        const [staffResult] = await connection.execute(sql2, [newUserId, staffName, staffRole, staffContact, staffBio, calendarId]);

        if (staffResult.affectedRows <= 0 || staffResult.insertId === null) {
            throw new Error('Failed to Insert into Staff Table');
        }
        const newStaffId = staffResult.insertId;

        //INSERT INTO STAFFSPECIALTY TABLE
        if (isServiceProvider === 1) {

            for (const service of servicesProvided) {
                const sql4 = "INSERT INTO STAFFSPECIALTY (STAFF_ID, SERVICE_CODE) VALUES (?, ?)"
                const [specialtyResult] = await connection.execute(sql4, [newStaffId, service]);

                if (specialtyResult.affectedRows <= 0) {
                    throw new Error('Failed to Insert into Staff Specialty Table');
                }
            }
        }
        await connection.query('COMMIT');
        return {
            status: 'success',
            message: 'Successfully Created New Staff Profile',
        }

    }
    catch (err) {
        await connection.query('ROLLBACK');
        throw new Error(err.message);
    }
}

const hashPassword = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    return hash;
}

const editExistingStaffProfile = async (profileDetails) => {
    try {
        const { staffId, staffUsername, staffName, staffEmail, staffRole, servicesProvided, staffContact, staffBio } = profileDetails;

        await connection.query('START TRANSACTION');
        //GET USER ID 
        const sql1 = "SELECT USER_ID AS userId FROM STAFF WHERE STAFF_ID = ?";
        const [userIdResult] = await connection.execute(sql1, [staffId]);

        if (!userIdResult || userIdResult.length === 0 || userIdResult[0].userId === undefined) {
            throw new Error('Failed to Get User ID');
        }

        const [{ userId }] = userIdResult;

        //UPDATE USER TABLE
        const sql2 = "UPDATE USER SET USER_EMAIL = ? WHERE USER_ID = ?";
        const [updateUserResult] = await connection.execute(sql2, [staffEmail, userId])

        if (updateUserResult.affectedRows <= 0) {
            throw new Error('Failed to Update User Table');
        }

        //IF PREVIOUS ROLE NOT SERVICE PROVIDER, GENERATE CALENDAR ID
        const sqlNewRole = "SELECT ROLE_IS_SERVICE_PROVIDER AS isServiceProviderNew FROM ROLE WHERE ROLE_CODE = ?";
        const [isServiceProviderResult] = await connection.execute(sqlNewRole, [staffRole])

        if (!isServiceProviderResult || isServiceProviderResult.length === 0 || isServiceProviderResult[0].isServiceProviderNew === undefined) {
            throw new Error('Failed to Get New Is Service Provider');
        }

        const [{ isServiceProviderNew }] = isServiceProviderResult;

        //GET PREVIOUS ROLE
        const sqlPrevRole = "SELECT r.ROLE_IS_SERVICE_PROVIDER AS isServiceProviderOld FROM ROLE r INNER JOIN STAFF s ON r.ROLE_CODE = s.ROLE_CODE WHERE STAFF_ID = ?";
        const [oldIsServiceProviderResult] = await connection.execute(sqlPrevRole, [staffId])

        if (!oldIsServiceProviderResult || oldIsServiceProviderResult.length === 0 || oldIsServiceProviderResult[0].isServiceProviderOld === undefined) {

            //CHECK CALENDAR ID (COULD BE PREVIOUSLY DELETED ROLE IS SERVICER PROVIDER) (TO DECIDE WHETHER NEED TO CREATE A NEW CALENDAR ID)
            const calendarExitsql = "SELECT STAFF_CALENDAR_ID AS oldCalId FROM STAFF WHERE STAFF_ID = ?";
            const [calResult] = await connection.execute(calendarExitsql, [staffId])
            const [{ oldCalId }] = calResult;
            if (oldCalId === null && isServiceProviderNew === 1) {

                //GENERATE CALENDAR ID
                const response = await createNewCalendar(staffUsername);
                const calendarId = response.data.calendarId;

                //UPDATE STAFF TABLE
                const sql3 = "UPDATE STAFF SET STAFF_FULL_NAME = ?, ROLE_CODE = ?, STAFF_CONTACT_NUMBER = ?, STAFF_BIO = ?, STAFF_CALENDAR_ID = ? WHERE STAFF_ID = ?";
                const [updateStaffResult] = await connection.execute(sql3, [staffName, staffRole, staffContact, staffBio, calendarId, staffId])

                if (updateStaffResult.affectedRows <= 0) {
                    throw new Error('Failed to Update Staff Table');
                }
            }

            else if (oldCalId === null && isServiceProviderNew === 0) {

                //UPDATE STAFF TABLE
                const sql3 = "UPDATE STAFF SET STAFF_FULL_NAME = ?, ROLE_CODE = ?, STAFF_CONTACT_NUMBER = ?, STAFF_BIO = ? WHERE STAFF_ID = ?";
                const [updateStaffResult] = await connection.execute(sql3, [staffName, staffRole, staffContact, staffBio, staffId])

                if (updateStaffResult.affectedRows <= 0) {
                    throw new Error('Failed to Update Staff Table');
                }
            }
            else {

                if (oldCalId !== null && isServiceProviderNew === 1) {

                    //UPDATE STAFF TABLE
                    const sql3 = "UPDATE STAFF SET STAFF_FULL_NAME = ?, ROLE_CODE = ?, STAFF_CONTACT_NUMBER = ?, STAFF_BIO = ? WHERE STAFF_ID = ?";
                    const [updateStaffResult] = await connection.execute(sql3, [staffName, staffRole, staffContact, staffBio, staffId])

                    if (updateStaffResult.affectedRows <= 0) {
                        throw new Error('Failed to Update Staff Table');
                    }
                }
                else if (oldCalId !== null && isServiceProviderNew === 0) {

                    //UPDATE STAFF TABLE
                    const sql3 = "UPDATE STAFF SET STAFF_FULL_NAME = ?, ROLE_CODE = ?, STAFF_CONTACT_NUMBER = ?, STAFF_BIO = ?, STAFF_CALENDAR_ID = ? WHERE STAFF_ID = ?";
                    const [updateStaffResult] = await connection.execute(sql3, [staffName, staffRole, staffContact, staffBio, null, staffId])

                    if (updateStaffResult.affectedRows <= 0) {
                        throw new Error('Failed to Update Staff Table');
                    }
                }
            }
        }
        else {
            const [{ isServiceProviderOld }] = oldIsServiceProviderResult;
            //Old Role is Not Service Provider and New Role is, therefore need to generate a Calendar ID
            if (isServiceProviderOld === 0 && isServiceProviderNew === 1) {

                //GENERATE CALENDAR ID
                const response = await createNewCalendar(staffUsername);
                const calendarId = response.data.calendarId;

                //UPDATE STAFF TABLE
                const sql3 = "UPDATE STAFF SET STAFF_FULL_NAME = ?, ROLE_CODE = ?, STAFF_CONTACT_NUMBER = ?, STAFF_BIO = ?, STAFF_CALENDAR_ID = ? WHERE STAFF_ID = ?";
                const [updateStaffResult] = await connection.execute(sql3, [staffName, staffRole, staffContact, staffBio, calendarId, staffId])

                if (updateStaffResult.affectedRows <= 0) {
                    throw new Error('Failed to Update Staff Table');
                }

            }

            //Old Role and New Role is Not Service Provider or Either Old Role and New Role is Service Provider, no changes needed
            else if (isServiceProviderOld === 0 && isServiceProviderNew === 0 || isServiceProviderOld === 1 && isServiceProviderNew === 1) {
                //UPDATE STAFF TABLE
                const sql3 = "UPDATE STAFF SET STAFF_FULL_NAME = ?, ROLE_CODE = ?, STAFF_CONTACT_NUMBER = ?, STAFF_BIO = ? WHERE STAFF_ID = ?";
                const [updateStaffResult] = await connection.execute(sql3, [staffName, staffRole, staffContact, staffBio, staffId])

                if (updateStaffResult.affectedRows <= 0) {
                    throw new Error('Failed to Update Staff Table');
                }
            }

            //Old Role is Service Provider and New Role is Not, therefore need to Update Calendar ID to null
            else if (isServiceProviderOld === 1 && isServiceProviderNew === 0) {
                //UPDATE STAFF TABLE
                const sql3 = "UPDATE STAFF SET STAFF_FULL_NAME = ?, ROLE_CODE = ?, STAFF_CONTACT_NUMBER = ?, STAFF_BIO = ?, STAFF_CALENDAR_ID = ? WHERE STAFF_ID = ?";
                const [updateStaffResult] = await connection.execute(sql3, [staffName, staffRole, staffContact, staffBio, null, staffId])

                if (updateStaffResult.affectedRows <= 0) {
                    throw new Error('Failed to Update Staff Table');
                }
            }
        }

        //UPDATE STAFF SPECIALTY
        const sql4 = "DELETE FROM STAFFSPECIALTY WHERE STAFF_ID = ?";
        await connection.execute(sql4, [staffId])

        if (servicesProvided.length > 0) {
            for (const service of servicesProvided) {
                const sql5 = "INSERT INTO STAFFSPECIALTY (STAFF_ID, SERVICE_CODE) VALUES (?, ?)"
                const [specialtyResult] = await connection.execute(sql5, [staffId, service]);

                if (specialtyResult.affectedRows <= 0) {
                    throw new Error('Failed to Insert into Staff Specialty Table');
                }
            }
        }

        await connection.query('COMMIT');

        return {
            status: 'success',
            message: 'Successfully Updated Staff Profile',
        }

    } catch (err) {
        await connection.query('ROLLBACK');
        throw new Error(err.message);
    }
}

const deleteExistingStaffProfile = async (staffId) => {
    try {
        await connection.query('START TRANSACTION');

        //GET USER ID
        const sql1 = "SELECT USER_ID AS userId FROM STAFF WHERE STAFF_ID = ?";
        const [userIdResult] = await connection.execute(sql1, [staffId]);

        if (!userIdResult || userIdResult.length === 0 || userIdResult[0].userId === undefined) {
            throw new Error('Failed to Get User ID');
        }

        const [{ userId }] = userIdResult;

        //DELETE FROM STAFF TABLE
        const sql2 = "DELETE FROM STAFF WHERE STAFF_ID = ?";

        const [deleteProfileResult] = await connection.execute(sql2, [staffId]);
        const rowAffected = deleteProfileResult.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Delete Staff Profile from Staff Table');
        }

        //DELETE FROM USER TABLE
        const sql3 = "DELETE FROM USER WHERE USER_ID = ?";

        const [deleteUserResult] = await connection.execute(sql3, [userId]);
        const rowAffected2 = deleteUserResult.affectedRows;

        if (rowAffected2 <= 0) {
            throw new Error('Failed to Delete User from User Table');
        }

        //DELETE FROM PRICERULE TABLE
        const sql4 = "DELETE FROM PRICERULE WHERE PRICEOPTION_CODE = 'SPECIALIST' AND PRICERULE_OPTION_VALUE = ?";

        await connection.execute(sql4, [staffId]);


        await connection.query('COMMIT');

        return {
            status: 'success',
            message: 'Successfully Deleted the Staff Profile',
        }

    } catch (err) {
        await connection.query('ROLLBACK');
        throw new Error(err.message);
    }
}

const fetchAllPriceOptions = async () => {
    try {

        const sql1 = "SELECT DISTINCT(PRICEOPTION_CODE) AS priceOptionCode, PRICEOPTION_NAME AS priceOptionName, PRICEOPTION_ACTIVE AS priceOptionIsActive FROM PRICEOPTION";
        const [priceOptionsResult] = await connection.execute(sql1);

        if (priceOptionsResult.length === 0) {
            throw new Error('Failed to Fetch All Price Options');
        }

        return {
            status: 'success',
            message: 'Successfully Fetch All Price Options',
            data: priceOptionsResult,
        }

    } catch (err) {

        throw new Error(err.message);
    }
}

const saveNewPriceOptions = async (priceOptions) => {
    try {
        const placeholders = priceOptions.map(() => '?').join(', ');
        const sql1 = `UPDATE PRICEOPTION SET PRICEOPTION_ACTIVE = CASE WHEN PRICEOPTION_CODE IN (${placeholders}) THEN 1 ELSE 0 END`;
        const [updatePriceOptionResult] = await connection.execute(sql1, priceOptions);

        const rowAffected = updatePriceOptionResult.affectedRows;

        if (rowAffected <= 0) {
            return {
                status: 'error',
                message: 'Failed to Update Price Options from Price Option Table',
            }
        }

        return {
            status: 'success',
            message: 'Successfully Updated Price Options in Price Option Table',

        }

    } catch (err) {

        throw new Error(err.message);
    }
}

const fetchAllPricingRules = async () => {
    try {
        const sql = "SELECT pr.PRICERULE_ID AS pricingRuleId, s.SERVICE_NAME AS serviceName, po.PRICEOPTION_NAME AS priceOptionName, CASE WHEN pr.PRICEOPTION_CODE = 'SPECIALIST' THEN st.STAFF_FULL_NAME ELSE pr.PRICERULE_OPTION_VALUE END AS priceRuleValueName, pr.PRICERULE_PRICE_ADJUSTMENT AS priceAdjustment, pr.SERVICE_CODE AS serviceCode, pr.PRICEOPTION_CODE AS priceOptionCode, pr.PRICERULE_OPTION_VALUE AS priceRuleValueCode FROM PRICERULE pr INNER JOIN SERVICE s ON pr.SERVICE_CODE = s.SERVICE_CODE INNER JOIN PRICEOPTION po ON pr.PRICEOPTION_CODE = po.PRICEOPTION_CODE LEFT JOIN STAFF st ON pr.PRICEOPTION_CODE = 'SPECIALIST' AND pr.PRICERULE_OPTION_VALUE = st.STAFF_ID ORDER BY s.SERVICE_NAME";


        const [pricingRulesResult] = await connection.execute(sql);

        if (pricingRulesResult.length === 0) {
            return {
                status: 'error',
                message: 'No Pricing Rules Found',
                data: null,
                additionalData: null,
            }
        }

        const pricingRulesData = pricingRulesResult.map((value) => {
            return [value.pricingRuleId, value.serviceName, value.priceOptionName, value.priceRuleValueName, value.priceAdjustment];
        });

        const additionalData = pricingRulesResult.map((value) => {

            return {
                pricingRuleId: value.pricingRuleId,
                serviceCode: value.serviceCode,
                priceOptionCode: value.priceOptionCode,
                priceRuleOptionValue: value.priceRuleValueCode,
                priceAdjustment: value.priceAdjustment,
            }
        });


        return {
            status: 'success',
            message: 'Successfully Fetched All Pricing Rules',
            data: {
                headers: ['Pricing Rule ID', 'Service Name', 'Price Option Name', 'Criteria', 'Price Adjustment'],
                pricingRulesData: pricingRulesData,
                additionalData: additionalData,

            }
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAllAgeCategories = async () => {
    try {
        const ageRange = process.env.AGERANGE;
        const ageCategories = reformatAgeCategories(ageRange);

        return {
            status: 'success',
            message: 'Successfully Retrieved Age Categories',
            data: ageCategories,

        }
    } catch (err) {
        throw new Error('Fail the Retrieved the Age Categories')
    }
}

const fetchAllMatchSpecialists = async (serviceCode) => {

    try {
        const sql = "SELECT sp.STAFF_ID AS staffId, s.STAFF_FULL_NAME AS staffName FROM STAFFSPECIALTY sp INNER JOIN STAFF s ON sp.STAFF_ID = s.STAFF_ID WHERE sp.SERVICE_CODE = ?";

        const [matchSpecialistsResult] = await connection.execute(sql, [serviceCode]);

        if (matchSpecialistsResult.length === 0) {
            return {
                status: 'error',
                message: 'No Match Specialists Found',
                data: null,
            }
        }

        return {
            status: 'success',
            message: 'Successfully Fetched All Pricing Rules',
            data: matchSpecialistsResult,
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const createNewPricingRule = async (pricingRuleDetails) => {
    try {

        const { serviceCode, priceOptionType, priceOptionValue, priceAdjustment } = pricingRuleDetails;

        const sql = "INSERT INTO PRICERULE (SERVICE_CODE, PRICEOPTION_CODE, PRICERULE_OPTION_VALUE, PRICERULE_PRICE_ADJUSTMENT) VALUES (?, ?, ?, ?)";

        const [newPricingRuleResult] = await connection.execute(sql, [serviceCode, priceOptionType, priceOptionValue, priceAdjustment]);

        if (newPricingRuleResult.affectedRows <= 0) {
            throw new Error('Failed to Insert into PriceRule Table');
        }


        return {
            status: 'success',
            message: 'Successfully Created New Pricing Rule',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const editExistingPricingRule = async (pricingRuleDetails) => {
    try {
        
        const { pricingRuleId, priceAdjustment } = pricingRuleDetails;

        const sql = "UPDATE PRICERULE SET PRICERULE_PRICE_ADJUSTMENT = ? WHERE PRICERULE_ID = ?";

        const [editPricingRuleResult] = await connection.execute(sql, [priceAdjustment, pricingRuleId]);

        if (editPricingRuleResult.affectedRows <= 0) {
            throw new Error('Failed to Update Pricing Rule');
        }


        return {
            status: 'success',
            message: 'Successfully Updated Pricing Rule',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const deleteExistingPricingRule = async (pricingRuleId) => {
    try {

        const sql = "DELETE FROM PRICERULE WHERE PRICERULE_ID = ?";

        const [deletePricingRuleResult] = await connection.execute(sql, [pricingRuleId]);

        if (deletePricingRuleResult.affectedRows <= 0) {
            throw new Error('Failed to Delete Pricing Rule from PriceRule Table');
        }

        return {
            status: 'success',
            message: 'Successfully Delete Pricing Rule',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchAllSalonServices, createNewService, editExistingService, deleteExistingService, fetchAllStaffProfiles, fetchAllAvailableRoles, fetchAllAvailableServices, createNewStaffProfile, editExistingStaffProfile, deleteExistingStaffProfile, fetchAllPriceOptions, saveNewPriceOptions, fetchAllPricingRules, fetchAllAgeCategories, fetchAllMatchSpecialists, createNewPricingRule, editExistingPricingRule, deleteExistingPricingRule, };