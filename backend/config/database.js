const { Sequelize } = require('sequelize');

const DB_NAME = process.env.MYSQL_DATABASE || 'so_web';
const DB_USER = process.env.MYSQL_USER || 'root';
const DB_PASSWORD = process.env.MYSQL_PASSWORD || 'Hazem@2003';
const DB_HOST = process.env.MYSQL_HOST || 'localhost';
const DB_DIALECT = process.env.MYSQL_DIALECT || 'mysql';

console.log('Connecting to MySQL database:', DB_NAME);
console.log('MYSQL_HOST:', DB_HOST);

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
        host: DB_HOST,
        dialect: DB_DIALECT,
        logging: false,
    }
);

module.exports = sequelize; 