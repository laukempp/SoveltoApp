/*const dotenv = require('dotenv');

dotenv.config();*/

module.exports = {
    port: 5432,
    dbConnectionString: 'postgres://postgres:Sovelto1@127.0.0.1:5432/quizbase',
    saltRounds: 2,
    jwtSecret: 'yo-its-a-secret',
    tokenExpireTime: '6h'
}

