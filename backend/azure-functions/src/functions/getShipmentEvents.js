const { app } = require("@azure/functions");
const { sql, getPool } = require("../shared/db");

app.http("getShipmentEvents", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "shipments/{productId}",
    handler: async (request, context) => {
        try {
            const { productId } = request.params;
            const pool = await getPool();
            const result = await pool.request()
                .input("productId", sql.NVarChar, productId)
                .query("SELECT * FROM ShipmentEvents WHERE ProductId = @productId ORDER BY RecordedAt ASC");

            return { jsonBody: { success: true, events: result.recordset } };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { success: false, message: error.message } };
        }
    }
});
