const { fetchAllRoles, createNewRole, editExistingRole, deleteExistingRole, fetchAllRolesObj, } = require('../services/userManagementService');

const fetchRoles = async () => {
    try {
        const response = await fetchAllRoles();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
};

const addNewRole = async (roleDetails) => {
    try {
        const response = await createNewRole(roleDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const editRole = async (roleDetails) => {
    try {
        const response = await editExistingRole(roleDetails);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const deleteRole = async (roleCode) => {
    try {
        const response = await deleteExistingRole(roleCode);
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

const fetchRolesObj = async () => {
    try {
        const response = await fetchAllRolesObj();
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { fetchRoles, addNewRole, editRole, deleteRole, fetchRolesObj, };