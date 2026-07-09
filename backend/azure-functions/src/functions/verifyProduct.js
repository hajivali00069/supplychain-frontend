const { app } = require("@azure/functions");
const { sql, getPool } = require("../shared/db");
const ledger = require("../shared/ledger");

// This is what verify.html calls when a customer scans a product's QR code.
// It returns the product record plus its full immutable event history, so
// the frontend can show "this product's journey has N verified events".
app.http("verifyProduct", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "verify/{productId}",
    handler: async (request, context) => {
        try {
            const { productId } = request.params;
            const pool = await getPool();

            const productResult = await pool.request()
                .input("productId", sql.NVarChar, productId)
                .query("SELECT * FROM Products WHERE ProductId = @productId");

            if (productResult.recordset.length === 0) {
                return { status: 404, jsonBody: { success: false, message: "Product not found - not authentic or not yet registered" } };
            }

            const history = await ledger.getHistory(productId);

            return {
                jsonBody: {
                    success: true,
                    authentic: true,
                    product: productResult.recordset[0],
                    verifiedEvents: history.length,
                    history
                }
            };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { success: false, message: error.message } };
        }
    }
});
