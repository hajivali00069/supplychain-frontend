const { app } = require("@azure/functions");
const { sql, getPool } = require("../shared/db");
const ledger = require("../shared/ledger");

app.http("getProductById", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "products/{productId}",
    handler: async (request, context) => {
        try {
            const { productId } = request.params;
            const pool = await getPool();
            const result = await pool.request()
                .input("productId", sql.NVarChar, productId)
                .query("SELECT * FROM Products WHERE ProductId = @productId");

            if (result.recordset.length === 0) {
                return { status: 404, jsonBody: { success: false, message: "Product not found" } };
            }

            const history = await ledger.getHistory(productId);

            return { jsonBody: { success: true, product: result.recordset[0], history } };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { success: false, message: error.message } };
        }
    }
});
