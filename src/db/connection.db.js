const mariadb = require('mariadb')

const pool = mariadb.createPool({
    host: process.env.DB_HOST           ||'localhost', 
    user: process.env.DB_USER           ||'root', 
    password: process.env.DB_PASSWORD   ||'claveSecreta',
    database: process.env.DB_DATABASE   ||'employees_dev',
    port:3307,
    allowPublicKeyRetrieval:true,
    connectionLimit: 5,
});

module.exports=pool