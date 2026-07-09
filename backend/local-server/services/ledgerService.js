// ============================================================================
// Ledger Service
// ============================================================================
// This is the single integration point for Azure Confidential Ledger.
// Every place in the app that needs to write an "immutable" event calls
// recordEvent() below - so when you're ready to wire up real ACL, you only
// need to change the inside of this one function.
//
// PHASE 2 TODO (Azure Confidential Ledger):
//   1. npm install @azure/identity @azure/confidential-ledger
//   2. Use DefaultAzureCredential (works with a Managed Identity once deployed)
//   3. Call ledgerClient.postLedgerEntry({ contents: JSON.stringify(eventData) })
//   4. Store the returned transactionId as LedgerTransactionId
//
// Until then, this stub still hashes and stores the event locally in the
// LedgerEntries table, so the rest of the app (verify.html, product history)
// already works against the real shape of the data.
// ============================================================================

const crypto = require("crypto");
const { sql, getPool } = require("../config/db");

const hashEvent = (eventData) => {
    return crypto.createHash("sha256").update(JSON.stringify(eventData)).digest("hex");
};

const recordEvent = async (productId, eventType, eventData) => {
    const recordHash = hashEvent(eventData);

    // --- Phase 2: replace this block with a real Azure Confidential Ledger call ---
    const ledgerTransactionId = `LOCAL-${recordHash.slice(0, 12)}`;
    // --------------------------------------------------------------------------

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
            FROM LedgerEntries
            WHERE ProductId = @productId
            ORDER BY CreatedAt ASC
        `);
    return result.recordset;
};

module.exports = { recordEvent, getHistory };
