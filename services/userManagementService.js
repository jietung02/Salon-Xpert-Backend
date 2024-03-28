const { connection } = require('../config/dbConnection');

const fetchAllRoles = async () => {
    try {
        const sql = "SELECT ROLE_CODE AS roleCode, ROLE_NAME AS roleName, ROLE_DESCRIPTION AS roleDescription, ROLE_IS_SERVICE_PROVIDER AS roleIsServiceProvider FROM role ORDER BY roleName";

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
        const sql = "INSERT INTO role (ROLE_CODE, ROLE_NAME, ROLE_DESCRIPTION, ROLE_IS_SERVICE_PROVIDER) VALUES (?, ?, ?, ?)";

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
        const sql = "UPDATE role SET ROLE_NAME = ?, ROLE_DESCRIPTION = ? WHERE ROLE_CODE = ?";

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
        const sql = "DELETE FROM role WHERE ROLE_CODE = ?";

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
        const sql = "SELECT ROLE_CODE AS roleCode, ROLE_NAME AS roleName FROM role ORDER BY roleName";

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

const fetchAllPermissionCategories = async () => {
    try {
        const sql = "SELECT DISTINCT(PERMISSION_CATEGORY) AS category, PERMISSION_CATEGORY_ORDER AS sequence FROM permission WHERE PERMISSION_CATEGORY != 'Customer' ORDER BY PERMISSION_CATEGORY_ORDER;";

        const [permissionCategoriesResult] = await connection.execute(sql);

        if (permissionCategoriesResult.length === 0) {
            return {
                status: 'error',
                message: 'No Permission Categories Found',
                data: null,
            }
        }

        return {
            status: 'success',
            message: 'Successfully Fetched All Permission Categories',
            data: permissionCategoriesResult,
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchAllRolePermissions = async (roleCode) => {
    try {
        const sql = "SELECT rp.ROLE_CODE AS roleCode, GROUP_CONCAT(DISTINCT(p.PERMISSION_CATEGORY)) AS permissionCategories FROM rolepermission rp INNER JOIN permission p ON rp.PERMISSION_CODE = p.PERMISSION_CODE WHERE ROLE_CODE = ? GROUP BY rp.ROLE_CODE";

        const [rolePermissionsResult] = await connection.execute(sql, [roleCode]);

        if (rolePermissionsResult.length === 0) {
            return {
                status: 'success',
                message: 'No Role Permissions Record Found',
                data: {
                    roleCode: roleCode,
                    permissionCategories: [],
                }
            }
        }
        const [rolePermissionsString] = rolePermissionsResult;
        const rolePermissions = {
            ...rolePermissionsString,
            permissionCategories: rolePermissionsString.permissionCategories.split(','),
        }


        return {
            status: 'success',
            message: 'Successfully Fetched All Role Permissions',
            data: rolePermissions,
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

const saveNewRoleAccess = async (rolePermissions) => {
    try {
        const { roleCode, permissions } = rolePermissions;

        await connection.query('START TRANSACTION');

        //Delete All RolePermission for that Role First
        const sql = "DELETE FROM rolepermission WHERE ROLE_CODE = ?";

        const [deleteRolePermissionsResult] = await connection.execute(sql, [roleCode]);

        const rowAffected = deleteRolePermissionsResult.affectedRows;

        //Get All the PERMISSION_CODE Based on the Selected Permission Categories
        const placeholders = permissions.map(() => '?').join(', ');
        const sql2 = `SELECT PERMISSION_CODE AS permissionCode FROM permission WHERE PERMISSION_CATEGORY IN (${placeholders})`;
        const [permissionCodesResult] = await connection.execute(sql2, permissions);

        if (permissionCodesResult.length === 0) {
            throw new Error('No Permission Codes Found');
        }

        for (const codes of permissionCodesResult) {
            const { permissionCode } = codes;

            const sql3 = "INSERT INTO rolepermission (ROLE_CODE, PERMISSION_CODE) VALUES (?, ?)";
            const [insertRolePermissionResult] = await connection.execute(sql3, [roleCode, permissionCode]);

            const rowAffected2 = insertRolePermissionResult.affectedRows;

            if (rowAffected2 <= 0) {
                throw new Error('Failed to Insert into RolePermission Table');
            }
        }

        await connection.query('COMMIT');

        return {
            status: 'success',
            message: 'Successfully Saved New Role Access',
        }

    } catch (err) {
        console.log(err)
        await connection.query('ROLLBACK');
        throw new Error(err.message);
    }
}

module.exports = { fetchAllRoles, createNewRole, editExistingRole, deleteExistingRole, fetchAllRolesObj, fetchAllPermissionCategories, fetchAllRolePermissions, saveNewRoleAccess, };