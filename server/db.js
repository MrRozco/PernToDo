const Pool = require('pg').Pool;
require('dotenv').config();

// Log the environment variables to verify they are loaded correctly

const pool = new Pool({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_DBPORT,
    database: 'todoApp'
});

module.exports = pool;