const { userAuthentication, getGuestAuthData } = require('../services/authService');

const authentication = async (username, password) => {
    //use the user name and password to find the user id and find their permission in the services to connect to db.
    // const 

    try {
        if (username === null || password === null) {
            throw new Error('Username or Password is Empty');
        }
        const response = await userAuthentication(username, password);
        return response;

    } catch (err) {
        throw new Error(err.message);
    }

}

const getGuestData = async () => {
    try { 

        const response = await getGuestAuthData();

        return response;

    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { authentication, getGuestData };