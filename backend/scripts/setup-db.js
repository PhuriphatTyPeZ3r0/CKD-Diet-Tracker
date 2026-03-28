const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
    let pool;
    try {
        const server = process.env.DB_SERVER || 'localhost';
        const dbName = process.env.DB_NAME || 'CKD_Diet_DB';
        
        console.log('Using Environment:', {
            server: server,
            database: dbName,
            driver: 'msnodesqlv8 (SQL Server)'
        });

        // Construct connection string for master
        // Use discovered driver or default
        const driverName = process.env.DB_DRIVER_STRING || '{ODBC Driver 18 for SQL Server}'; // Default to 18 as it worked in test
        
        // Use connection string for msnodesqlv8
        const masterConnString = `Driver=${driverName};Server=${server};Database=master;Trusted_Connection=yes;Encrypt=false;`;
        console.log(`Using Driver: ${driverName}`);
        console.log(`Master Connection String: ${masterConnString}`);

        try {
            pool = await sql.connect(masterConnString);
        } catch (err) {
             console.error('Failed to connect with primary driver string. Error:', err.message);
             // If failed, try fallback without braces or check
             throw err;
        }

        console.log(`Checking if database '${dbName}' exists...`);
        
        const dbCheck = await pool.request().query(`
            SELECT name FROM master.dbo.sysdatabases WHERE name = N'${dbName}'
        `);

        if (dbCheck.recordset.length === 0) {
            console.log(`Database '${dbName}' not found. Creating...`);
            await pool.request().query(`CREATE DATABASE ${dbName}`);
            console.log(`Database '${dbName}' created.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }

        await pool.close();

        // 2. Connect to the target database
        const targetConnString = `Driver={SQL Server};Server=${server};Database=${dbName};Trusted_Connection=yes;`;
        console.log(`Connecting to database '${dbName}'...`);
        pool = await sql.connect(targetConnString);

        // 3. Read and execute the SQL script
        const scriptPath = path.join(__dirname, '../../database/CKD_Diet_DB.sql');
        console.log(`Reading SQL script from: ${scriptPath}`);
        
        const sqlScript = fs.readFileSync(scriptPath, 'utf8');
        
        // Split by GO statements as mssql driver doesn't support GO
        // Remove comments, whitespace, empty lines for cleaner execution if needed,
        // or rely on GO splitting.
        const commands = sqlScript
            .split(/GO\s*$/gmi)
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`Found ${commands.length} SQL command batches.`);

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            
            // Skip database creation/use statements if present in script
            if (command.toLowerCase().includes('create database') || 
                command.toLowerCase().includes('use ckd_diet_db')) {
                console.log(`Skipping command batch ${i + 1} (Create/Use DB handled manually).`);
                continue;
            }

            try {
                console.log(`Executing batch ${i + 1}...`);
                await pool.request().query(command);
                console.log(`Batch ${i + 1} executed successfully.`);
            } catch (err) {
                // Ignore "already calls" error if table exists, or handle gracefully
                if (err.message.includes('There is already an object named')) {
                     console.log(`Batch ${i + 1} skipped (Object likely already exists): ${err.message}`);
                } else {
                    console.error(`Error executing batch ${i + 1}:`, err.message);
                    // Decide whether to stop or continue. Usually stop on schema error.
                    // throw err; 
                }
            }
        }

        console.log('Database setup completed successfully.');

    } catch (err) {
        console.error('Database setup failed:', err);
    } finally {
        if (pool) await pool.close();
    }
}

setupDatabase();