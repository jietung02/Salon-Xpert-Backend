const bcrypt = require('bcrypt');
const { connection } = require('../config/dbConnection');
const { adminPermissions } = require('../utils/adminPermissions');
const { guestPermissions } = require('../utils/guestPermissions');

const getGuestAuthData = async () => {
    try {

        return {
            isAuthenticated: 'guest',
            username: null,
            name: null,
            email: null,
            gender: null,
            age: null,
            contact: null,
            role: null,
            permissions: [
                {
                    rolePermission: 'Guest',
                    functions: [{ name: 'Book Appointment', route: 'guest/new-appointment' },]
                },
            ],
            token: null,
            isLoggedOut: null,
        };
    } catch (error) {
        throw new Error('Fail to Get Guest Data')
    }
}

const userRegistration = async (userData) => {
    try {

        if (!userData.hasOwnProperty('password') || userData.password === null) {
            throw new Error("Password is required");

        }

        const hashedPassword = await hashPassword(userData.password);
        const hashUserData = { ...userData, password: hashedPassword };
        const response = await createUser(hashUserData);
        return;

    } catch (err) {
        throw new Error(err.message);
    }
};

// const userData = {
//     isAuthenticated: true,
//     username: 'Jie',
//     role: 'staff',
//     permissions: [
//         {
//             rolePermission: 'Service Management',
//             functions: [{ name: 'Update Service Price', route: '/staff/update-service-price' }, { name: 'View Own Schedule', route: '/staff/view-schedule' }],
//         },
//         {
//             rolePermission: 'Dashboard',
//             functions: [{ name: 'Dashboard', route: '/staff' }, { name: 'View all Staff Schedules', route: '/staff/staff-schedules' }],
//         },
//         {
//             rolePermission: 'User Management',
//             functions: [{ name: 'Manage Roles', route: '/staff/roles' }, { name: 'Access Control', route: '/staff/access-control' }],
//         },

//     ],
//     token: 'JWT token',
//     isLoggedOut: false,
// };

const userAuthentication = async (username, password) => {
    try {
        const [userId, role] = await verifyPassword(username, password);
        const userData = await getUserData(userId, role);
        const permissions = await fetchUserPermissions(userId, role);

        return {
            isAuthenticated: true,
            username,
            ...userData,
            role,
            permissions,
            token: null,
            isLoggedOut: false,
        };

    } catch (err) {
        throw new Error(err.message);
    }


};

const getUserData = async (userId, role) => {
    try {

        if (role === 'customer') {
            const sql = "SELECT CUSTOMER_ID AS id, CUSTOMER_FULL_NAME AS name, USER_EMAIL AS email, CUSTOMER_GENDER AS gender, TIMESTAMPDIFF(YEAR, CUSTOMER_BIRTHDATE, CURDATE()) AS age, CUSTOMER_CONTACT_NUMBER AS contact FROM CUSTOMER AS c INNER JOIN USER AS u ON c.USER_ID = u.USER_ID WHERE c.USER_ID = ?";
            const [userDataResults] = await connection.execute(sql, [userId]);

            if (userDataResults.length === 0) {
                throw new Error('No User Data Found');
            }

            const [userData] = userDataResults;

            return userData;
        }

        else if (role === 'guest') {
            const sql = "SELECT g.GUEST_ID AS id, g.GUEST_FULL_NAME AS name, u.USER_EMAIL AS email, g.GUEST_GENDER AS gender, g.GUEST_AGE AS age, g.GUEST_CONTACT_NUMBER AS contact FROM GUEST g INNER JOIN USER u ON g.USER_ID = u.USER_ID WHERE u.USER_ID = ? ORDER BY g.GUEST_ID DESC LIMIT 1";
            const [userDataResults] = await connection.execute(sql, [userId]);

            if (userDataResults.length === 0) {
                throw new Error('No User Data Found');
            }

            const [userData] = userDataResults;

            return userData;
        }

        else if (role === 'staff') {
            const sql = "SELECT s.STAFF_ID AS id, s.STAFF_FULL_NAME AS name, s.STAFF_CONTACT_NUMBER AS contact, u.USER_EMAIL AS email FROM STAFF s INNER JOIN USER u ON s.USER_ID = u.USER_ID WHERE u.USER_ID = ?";
            const [userDataResults] = await connection.execute(sql, [userId]);
            console.log(userDataResults)
            if (userDataResults.length === 0) {
                throw new Error('No User Data Found');
            }

            const [userData] = userDataResults;

            return userData;
        }
        //ONLY CUSTOMER IS REQUIRED FOR THIS

        // else if (role === 'admin') {
        //     // admin role will be admin
        // }
        // else if (role === 'staff') {
        //     const sql = "";

        //     const [userDataResults] = await connection.execute(sql, [userId]);

        //     if (userDataResults.length === 0) {
        //         throw new Error('No User Data Found');
        //     }
        //     const userData = await converUserDataFormat(userDataResults, role);
        //     // console.dir(permissions, { depth: null });
        //     return userData;
        // }
        else {
            return null;
            // throw new Error('Invalid Role');
        }

    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

const fetchUserPermissions = async (userId, role) => {

    try {

        if (role === 'customer') {
            const sql = "SELECT PERMISSION_CATEGORY, PERMISSION_NAME, PERMISSION_ROUTE FROM PERMISSION WHERE PERMISSION_CATEGORY = ? ORDER BY PERMISSION_CATEGORY_ORDER, PERMISSION_ORDER_INDEX";
            const [permissionsResult] = await connection.execute(sql, ['Customer']);

            if (permissionsResult.length === 0) {
                throw new Error('No Permission Found');
            }
            const permissions = await convertPermissionsFormat(permissionsResult, role);

            return permissions;
        }
        else if (role === 'guest') {
            const permissions = getGuestPermissions();

            return permissions;
        }

        else if (role === 'admin') {
            const permissions = getAdminPermissions();

            return permissions;
            // return the hard coded access to admin
        }
        else if (role === 'staff') {
            const sql = "SELECT PERMISSION.PERMISSION_CATEGORY , PERMISSION.PERMISSION_NAME, PERMISSION.PERMISSION_ROUTE FROM USER INNER JOIN STAFF ON USER.USER_ID = STAFF.USER_ID INNER JOIN ROLEPERMISSION ON STAFF.ROLE_CODE = ROLEPERMISSION.ROLE_CODE INNER JOIN PERMISSION ON ROLEPERMISSION.PERMISSION_CODE = PERMISSION.PERMISSION_CODE WHERE USER.USER_ID = ? ORDER BY PERMISSION_CATEGORY_ORDER, PERMISSION_ORDER_INDEX";

            const [permissionsResult] = await connection.execute(sql, [userId]);

            if (permissionsResult.length === 0) {
                throw new Error('No Permission Found');
            }
            const permissions = await convertPermissionsFormat(permissionsResult, role);
            // console.dir(permissions, { depth: null });
            return permissions;
        }
        else {
            throw new Error('Invalid Role');
        }

    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

const getGuestPermissions = () => {
    return guestPermissions;
}

const getAdminPermissions = () => {
    return adminPermissions;
}

const convertPermissionsFormat = async (permissions, role) => {
    try {
        const reformat = permissions.reduce((accum, item) => {
            const existingRolePermission = accum.find(role => role.rolePermission === item.PERMISSION_CATEGORY);
            if (existingRolePermission) {
                existingRolePermission.functions.push({
                    name: item.PERMISSION_NAME,
                    route: replaceRoleInRoute(role, item.PERMISSION_ROUTE),
                });
            }
            else {
                accum.push({
                    rolePermission: item.PERMISSION_CATEGORY,
                    functions: [{
                        name: item.PERMISSION_NAME,
                        route: replaceRoleInRoute(role, item.PERMISSION_ROUTE),
                    }]
                });
            }
            return accum;
        }, []);

        return reformat;
    } catch (error) {
        throw new Error('Fail to Convert Permissions');
    }

}

const replaceRoleInRoute = (role, route) => {
    return route.replace('/role', `/${role.toLowerCase()}`);
}

const verifyPassword = async (username, password) => {
    try {
        const sql = "SELECT USER_ID, USER_PASSWORD_HASH, USER_ROLE FROM USER WHERE USER_USERNAME = ?";

        const [result] = await connection.execute(sql, [username]);

        if (result.length === 0) {
            throw new Error('User Not Found');
        }
        [{ USER_ID: userId, USER_PASSWORD_HASH: hashedPassword, USER_ROLE: role }] = result;
        const isValid = await comparePassword(password, hashedPassword);

        if (!isValid) {
            throw new Error('Invalid Username or Password');
        }
        return [userId, role];

    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

const createUser = async (userData) => {

    try {
        const { username, password, email, name, gender, birthdate, contact } = userData;
        const sql = "INSERT INTO USER (USER_USERNAME, USER_PASSWORD_HASH, USER_EMAIL, USER_ROLE) VALUES (?, ?, ?, ?)";
        const [userResult] = await connection.execute(sql, [username, password, email, 'customer']);

        const newUserId = userResult.insertId;
        const sql2 = "INSERT INTO CUSTOMER (USER_ID, CUSTOMER_FULL_NAME, CUSTOMER_GENDER, CUSTOMER_BIRTHDATE, CUSTOMER_CONTACT_NUMBER) VALUES (?, ?, ?, ?, ?)";
        const [customerResult] = await connection.execute(sql2, [newUserId, name, gender, birthdate, contact]);

        return;
    }
    catch (err) {
        throw new Error(err.sqlMessage);
    }
}

const comparePassword = async (plaintextPassword, hash) => {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}

const hashPassword = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    return hash;
}

module.exports = { userRegistration, userAuthentication, getGuestAuthData, hashPassword, };