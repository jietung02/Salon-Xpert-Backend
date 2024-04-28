const mysql = require('mysql2/promise');

const connection = mysql.createPool({

    connectionLimit: 10,
    host: process.env.NODE_ENV === 'production' ? process.env.DATABASE_HOST : 'localhost',
    user: process.env.NODE_ENV === 'production' ? process.env.DATABASE_USER : 'root',
    password: process.env.NODE_ENV === 'production' ? process.env.DATABASE_PASSWORD : 'mysql1234',
    database: process.env.NODE_ENV === 'production' ? process.env.DATABASE_DATABASE : 'salon_xpert1',

});


module.exports = { connection };