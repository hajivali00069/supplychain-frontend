// Azure SQL Database connection pool (mssql driver).
// Works identically whether you're pointed at a local SQL Server for testing
// or your real Azure SQL Database instance - just change the .env values.

const sql = require("mssql");

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,       // e.g. yourserver.database.windows.net
    database: process.env.DB_NAME,
    port: 1433,
    options: {
        encrypt: true,                  // required for Azure SQL
        trustServerCertificate: false
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise;

const getPool = () => {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then((pool) => {
                console.log("✅ Connected to Azure SQL Database");
                return pool;
            })
            .catch((err) => {
                console.error("❌ Database connection failed:", err.message);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
};

module.exports = { sql, getPool };
