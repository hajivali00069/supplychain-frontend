// Same integration point as backend/local-server/services/ledgerService.js.
// See that file's comments for the Azure Confidential Ledger TODO steps.

const crypto = require("crypto");
const { sql, getPool } = require("./db");

const hashEvent = (eventData) => crypto.createHash("sha256").update(JSON.stringify(eventData)).digest("hex");

const recordEvent = async (productId, eventType, eventData) => {
    const recordHash = hashEvent(eventData);
    const ledgerTransactionId = `LOCAL-${recordHash.slice(0, 12)}`; // Phase 2: real ACL transaction id

    const pool = await getPool();
    await pool.request()
        .input("productId", sql.NVarChar, productId)
        .input("eventType", sql.NVarChar, eventType)
        .input("eventData", sql.NVarChar(sql.MAX), JSON.stringify(eventData))
        .input("recordHash", sql.NVarChar, recordHash)
        .input("ledgerTransactionId", sql.NVarChar, ledgerTransactionId)
        .query(`
            INSERT INTO LedgerEntries (ProductId, EventType, EventData, RecordHash, LedgerTransactionId)
            VALUES (@productId, @eventType, @eventData, @recordHash, @ledgerTransactionId)
        `);

    return { recordHash, ledgerTransactionId };
};

const getHistory = async (productId) => {
    const pool = await getPool();
    const result = await pool.request()
        .input("productId", sql.NVarChar, productId)
        .query(`
            SELECT EventType, EventData, RecordHash, LedgerTransactionId, CreatedAt
            FROM LedgerEntries WHERE ProductId = @productId ORDER BY CreatedAt ASC
        `);
    return result.recordset;
};

module.exports = { recordEvent, getHistory };
