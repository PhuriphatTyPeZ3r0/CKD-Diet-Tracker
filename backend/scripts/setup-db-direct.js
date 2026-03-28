// Use native msnodesqlv8 driver directly for reliable connection string support
const sql = require('msnodesqlv8');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const driver = process.env.DB_DRIVER_STRING || '{ODBC Driver 18 for SQL Server}';
// Ensure default server is (local)\SQLEXPRESS or similar
const server = process.env.DB_SERVER || '(local)\\SQLEXPRESS';
const dbName = process.env.DB_NAME || 'CKD_Diet_DB';

// Use same connection string logic as test-db.js which passed
const masterConnString = `Driver=${driver};Server=${server};Database=master;Trusted_Connection=Yes;Encrypt=No;`;
const targetConnString = `Driver=${driver};Server=${server};Database=${dbName};Trusted_Connection=Yes;Encrypt=No;`;

async function executeQuery(connStr, query) {
    return new Promise((resolve, reject) => {
        sql.open(connStr, (err, conn) => {
            if (err) return reject(err);
            conn.query(query, (err, rows) => {
                conn.close(() => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        });
    });
}

async function setupDatabase() {
    try {
        console.log('--- Database Setup Script (Direct msnodesqlv8) ---');
        console.log(`Server: ${server}`);
        console.log(`Driver: ${driver}`);
        console.log(`Connecting to master...`);

        // Check DB existence
        const checkDbQuery = `SELECT name FROM master.dbo.sysdatabases WHERE name = N'${dbName}'`;
        
        let dbExists = false;
        try {
            const result = await executeQuery(masterConnString, checkDbQuery);
            if (result && result.length > 0) {
                dbExists = true;
                console.log(`Database '${dbName}' already exists.`);
            }
        } catch (err) {
            // If connection fails, logging it
            console.error('Failed to connect to master:', err);
            // Try creating anyway? No, connection failed.
            throw err;
        }

        if (!dbExists) {
            console.log(`Database '${dbName}' not found. Creating...`);
            await executeQuery(masterConnString, `CREATE DATABASE ${dbName}`);
            console.log(`Database '${dbName}' created.`);
        }

        // Read SQL script
        console.log(`Reading SQL script...`);
        const scriptPath = path.join(__dirname, '../../database/CKD_Diet_DB.sql');
        const sqlScript = fs.readFileSync(scriptPath, 'utf8');
        
        // Split by GO
        const commands = sqlScript
            .split(/^GO\s*$/gmi) // Matches GO on its own line
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);

        console.log(`Found ${commands.length} SQL batches.`);

        // Execute batches sequentially using single connection if possible or open/close
        // Opening/closing per batch is safer for simple script but slower.
        // Let's reuse connection.
        
        console.log(`Connecting to target database '${dbName}'...`);
        
        await new Promise((resolve, reject) => {
            sql.open(targetConnString, (err, conn) => {
                if (err) return reject(err);
                
                let i = 0;
                const runNext = () => {
                    if (i >= commands.length) {
                        conn.close(() => resolve());
                        return;
                    }
                    
                    const cmd = commands[i];
                    console.log(`Executing batch ${i + 1}/${commands.length}...`);
                    
                    conn.query(cmd, (qErr) => {
                        if (qErr) {
                            if (qErr.message && qErr.message.includes('There is already an object named')) {
                                console.log(`  -> Skipped (Object exists).`);
                            } else {
                                console.error(`  -> Error: ${qErr.message}`);
                            }
                        } else {
                            console.log(`  -> Success.`);
                        }
                        i++;
                        runNext();
                    });
                };
                
                runNext();
            });
        });

        console.log('Database setup completed successfully.');

    } catch (err) {
        console.error('Setup failed:', err);
    }
}

setupDatabase();