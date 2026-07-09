const { app } = require("@azure/functions");
const { sql, getPool } = require("../shared/db");
const ledger = require("../shared/ledger");

// This is the natural place to plug in "smart contract" style automation -
// e.g. when status becomes "Delivered", trigger a payment-release call or a
// Logic App notification. See docs/AZURE_INTEGRATION_GUIDE.md Phase 2.
app.http("updateProductStatus", {
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "products/{productId}",
    handler: async (request, context) => {
        try {
            const { productId } = request.params;
            const { status } = await request.json();

            const pool = await getPool();
            const result = await pool.request()
                .input("productId", sql.NVarChar, productId)
                .input("status", sql.NVarChar, status)
                .query(`
                    UPDATE Products SET Status = @status, UpdatedAt = SYSUTCDATETIME()
                    WHERE ProductId = @productId;
                    SELECT * FROM Products WHERE ProductId = @productId;
                `);

            if (result.recordset.length === 0) {
                return { status: 404, jsonBody: { success: false, message: "Product not found" } };
            }

            const ledgerResult = await ledger.recordEvent(productId, "StatusChange", { productId, status });

            if (status === "Delivered") {
                // TODO Phase 2: call a payment/notification hook here
                context.log(`Product ${productId} marked Delivered - automation hook fires here.`);
            }

            return {
                jsonBody: {
                    success: true,
                    message: "Product updated successfully",
                    product: result.recordset[0],
                    ledger: ledgerResult
                }
            };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { success: false, message: error.message } };
        }
    }
});
