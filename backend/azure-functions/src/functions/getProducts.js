const { app } = require("@azure/functions");
const { getPool } = require("../shared/db");

app.http("getProducts", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "products",
    handler: async (request, context) => {
        try {
            const pool = await getPool();
            const result = await pool.request().query("SELECT * FROM Products ORDER BY CreatedAt DESC");
            return { jsonBody: { success: true, count: result.recordset.length, products: result.recordset } };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { success: false, message: error.message } };
        }
    }
});
