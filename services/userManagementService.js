const { connection } = require('../config/dbConnection');

const fetchAllRoles = async () => {
    try {
        const sql = "SELECT ROLE_CODE AS roleCode, ROLE_NAME AS roleName, ROLE_DESCRIPTION AS roleDescription, ROLE_IS_SERVICE_PROVIDER AS roleIsServiceProvider FROM ROLE ORDER BY roleName";

        const [rolesResult] = await connection.execute(sql);

        if (rolesResult.length === 0) {
            return {
                status: 'error',
                message: 'No Roles Found',
                data: null,
            }
        }
        const rolesData = rolesResult.map((value) => {
            return [value.roleCode, value.roleName, value.roleDescription, value.roleIsServiceProvider === 1 ? 'Yes' : 'No'];
        })

        return {
            status: 'success',
            message: 'Successfully Fetched All Roles',
            data: {
                headers: ['Role Code', 'Name', 'Description', 'Service Provider'],
                rolesData: rolesData,
            }
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const createNewRole = async (roleDetails) => {
    try {
        const { roleCode, roleName, roleDescription, roleIsServiceProvider } = roleDetails;
        const sql = "INSERT INTO ROLE (ROLE_CODE, ROLE_NAME, ROLE_DESCRIPTION, ROLE_IS_SERVICE_PROVIDER) VALUES (?, ?, ?, ?)";

        const [newRoleResult] = await connection.execute(sql, [roleCode, roleName, roleDescription, roleIsServiceProvider]);
        const rowAffected = newRoleResult.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Insert into Role Table');
        }

        return {
            status: 'success',
            message: 'Successfully Created New Role',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const editExistingRole = async (roleDetails) => {
    try {
        const { roleCode, roleName, roleDescription, roleIsServiceProvider } = roleDetails;
        const sql = "UPDATE ROLE SET ROLE_NAME = ?, ROLE_DESCRIPTION = ? WHERE ROLE_CODE = ?";

        const [editRoleResult] = await connection.execute(sql, [roleName, roleDescription, roleCode]);
        const rowAffected = editRoleResult.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Update Role Table');
        }

        return {
            status: 'success',
            message: 'Successfully Updated Role',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const deleteExistingRole = async (roleCode) => {
    try {
        const sql = "DELETE FROM ROLE WHERE ROLE_CODE = ?";

        const [deleteRoleResult] = await connection.execute(sql, [roleCode]);
        const rowAffected = deleteRoleResult.affectedRows;

        if (rowAffected <= 0) {
            throw new Error('Failed to Delete Role from Role Table');
        }

        return {
            status: 'success',
            message: 'Successfully Deleted Role',
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAllRolesObj = async () => {
    try {
        const sql = "SELECT ROLE_CODE AS roleCode, ROLE_NAME AS roleName FROM ROLE ORDER BY roleName";

        const [rolesResult] = await connection.execute(sql);

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

module.exports = { fetchAllRoles, createNewRole, editExistingRole, deleteExistingRole, fetchAllRolesObj, };