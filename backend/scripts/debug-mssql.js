const sql = require('mssql/msnodesqlv8');

const connString = "Driver={ODBC Driver 18 for SQL Server};Server=(local)\\SQLEXPRESS;Database=CKD_Diet_DB;Trusted_Connection=Yes;Encrypt=No;";

async function testString() {
    console.log("Testing connection string...");
    try {
        await sql.connect(connString);
        console.log("String connection success!");
        await sql.close();
    } catch (err) {
        console.error("String connection failed:", err.message);
    }
}

async function testConfig() {
    console.log("Testing config object...");
    const config = {
        server: '(local)\\SQLEXPRESS',
        database: 'CKD_Diet_DB',
        driver: 'msnodesqlv8',
        options: {
            trustedConnection: true,
            encrypt: false
        }
    };
    try {
        await sql.connect(config);
        console.log("Config connection success!");
        await sql.close();
    } catch (err) {
        console.error("Config connection failed:", err.message);
    }
}

async function testConfigWithDriver() {
    console.log("Testing config object with driver option...");
    const config = {
        server: '(local)\\SQLEXPRESS',
        database: 'CKD_Diet_DB',
        driver: 'msnodesqlv8',
        options: {
            trustedConnection: true,
            encrypt: false,
            driver: 'ODBC Driver 18 for SQL Server' // Trying this
        }
    };
    try {
        await sql.connect(config);
        console.log("Config+Driver connection success!");
        await sql.close();
    } catch (err) {
        console.error("Config+Driver connection failed:", err.message);
    }
}

async function testConnectionStringProp() {
    console.log("Testing config.connectionString property...");
    const config = {
        connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=(local)\\SQLEXPRESS;Database=CKD_Diet_DB;Trusted_Connection=Yes;Encrypt=No;',
    };
    try {
        await sql.connect(config);
        console.log("Config.connectionString connection success!");
        await sql.close();
    } catch (err) {
        console.error("Config.connectionString connection failed:", err.message);
    }
}

async function run() {
    await testConnectionStringProp();
}

run();