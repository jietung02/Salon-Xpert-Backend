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
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,

});


module.exports = { connection };