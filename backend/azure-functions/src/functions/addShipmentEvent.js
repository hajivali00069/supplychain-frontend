const { app } = require("@azure/functions");
const { sql, getPool } = require("../shared/db");

// PHASE 2: replace the manual POST trigger with an IoT Hub trigger so
// simulated sensor devices feed this table automatically. Keep this HTTP
// version around too - it's useful for manual testing and for logistics
// partners without their own IoT device.
app.http("addShipmentEvent", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "shipments",
    handler: async (request, context) => {
        try {
            const { productId, location, latitude, longitude, temperature, status } = await request.json();
            const pool = await getPool();

            await pool.request()
                .input("productId", sql.NVarChar, productId)
                .input("location", sql.NVarChar, location || null)
                .input("latitude", sql.Decimal(9, 6), latitude || null)
                .input("longitude", sql.Decimal(9, 6), longitude || null)
                .input("temperature", sql.Decimal(5, 2), temperature || null)
                .input("status", sql.NVarChar, status)
                .query(`
                    INSERT INTO ShipmentEvents (ProductId, Location, Latitude, Longitude, Temperature, Status)
                    VALUES (@productId, @location, @latitude, @longitude, @temperature, @status)
                `);

            return { status: 201, jsonBody: { success: true, message: "Shipment event recorded" } };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { success: false, message: error.message } };
        }
    }
});
