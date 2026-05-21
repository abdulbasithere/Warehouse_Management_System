require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 1433,
        logging: console.log,
        dialect: 'mssql',
        dialectOptions: {
            options: { encrypt: false }
        }
    },
    master: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'master',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 1433,
        dialect: 'mssql',
        logging: false,
        dialectOptions: {
            options: { encrypt: false }
        }
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mssql',
        logging: false,
        dialectOptions: {
            options: { encrypt: true }
        }
    }
};
