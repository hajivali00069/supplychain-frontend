const { app } = require("@azure/functions");
const { sql, getPool } = require("../shared/db");
const ledger = require("../shared/ledger");

app.http("addProduct", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "products",
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const {
                productId, productName, batchNumber, supplierId,
                manufacturingDate, expiryDate
            } = body;

            const pool = await getPool();
            await pool.request()
                .input("productId", sql.NVarChar, productId)
                .input("productName", sql.NVarChar, productName)
                .input("batchNumber", sql.NVarChar, batchNumber)
                .input("supplierId", sql.NVarChar, supplierId)
                .input("manufacturingDate", sql.Date, manufacturingDate)
                .input("expiryDate", sql.Date, expiryDate)
                .query(`
                    INSERT INTO Products (ProductId, ProductName, BatchNumber, SupplierId, ManufacturingDate, ExpiryDate)
                    VALUES (@productId, @productName, @batchNumber, @supplierId, @manufacturingDate, @expiryDate)
                `);

            // Note: QR code generation is handled client-side or via a separate
            // Blob-Storage-backed function in Phase 2 (see docs/AZURE_INTEGRATION_GUIDE.md)
            const ledgerResult = await ledger.recordEvent(productId, "Created", body);

            return {
                status: 201,
                jsonBody: { success: true, message: "Product added successfully", productId, ledger: ledgerResult }
            };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { success: false, message: error.message } };
        }
    }
});
