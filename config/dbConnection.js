const mysql = require('mysql2/promise');

// const connectToDatabase = async () => {

//     try {

//         console.log('Connected to the database successfully!');
//         // const [rows, fields] = await connection.execute(`USE DATABASE ${process.env.DATABASE_DATABASE}`);
//         // const [tables, tablefields] = await connection.execute(`SHOW TABLES`);
//         // tables.forEach(table => {
//         //   console.log(table);
//         // });
//     } catch (err) {
//         console.log('Error connecting to the database:', err.stack);
//     }


// }

const connection = mysql.createPool({

    connectionLimit: 10,
    host: process.env.NODE_ENV === 'production' ? process.env.DATABASE_HOST : 'localhost',
    user: process.env.NODE_ENV === 'production' ? process.env.DATABASE_USER : 'root',
    password: process.env.NODE_ENV === 'production' ? process.env.DATABASE_PASSWORD : 'mysql1234',
    database: process.env.NODE_ENV === 'production' ? process.env.DATABASE_DATABASE : 'salon_xpert1',

});


module.exports = { connection };