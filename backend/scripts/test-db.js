const sql = require('msnodesqlv8');

const drivers = [
    '{ODBC Driver 18 for SQL Server}',
    '{ODBC Driver 17 for SQL Server}',
    '{SQL Server Native Client 11.0}',
    '{SQL Server}',
    'SQL Server'
];

async function testConnection() {
    console.log('Testing msnodesqlv8 direct connection...');
    
    for (const driverName of drivers) {
        const connStr = `Driver=${driverName};Server=(local)\\SQLEXPRESS;Database=master;Trusted_Connection=Yes;Encrypt=No;`;
        console.log(`Trying: ${connStr}`);
        
        try {
            await new Promise((resolve, reject) => {
                sql.open(connStr, (err, conn) => {
                    if (err) return reject(err);
                    console.log(`SUCCESS with driver: ${driverName}`);
                    conn.close(() => resolve());
                });
            });
            break; // Stop on success
        } catch (err) {
            console.error(`FAILED: ${err.message}`);
        }
    }
}

testConnection();