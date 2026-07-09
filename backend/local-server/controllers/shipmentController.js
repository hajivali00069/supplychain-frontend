// ============================================================================
// Shipment / Tracking Controller
// ============================================================================
// PHASE 2 TODO (Azure IoT Hub): a simulated device (or a small script) will
// publish telemetry (location, temperature) to IoT Hub. An Azure Function
// with an IoT Hub trigger will consume that telemetry and call
// addShipmentEvent-equivalent logic to insert rows here automatically.
// For now, this endpoint lets you POST tracking updates manually so the
// frontend (track.html) has something real to render against.
// ============================================================================

const { sql, getPool } = require("../config/db");

const addShipmentEvent = async (req, res) => {
    try {
        const { productId, location, latitude, longitude, temperature, status } = req.body;
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

        res.status(201).json({ success: true, message: "Shipment event recorded" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getShipmentEvents = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("productId", sql.NVarChar, req.params.productId)
            .query(`
                SELECT * FROM ShipmentEvents
                WHERE ProductId = @productId
                ORDER BY RecordedAt ASC
            `);
        res.status(200).json({ success: true, events: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addShipmentEvent, getShipmentEvents };
