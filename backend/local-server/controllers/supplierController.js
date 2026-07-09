const { sql, getPool } = require("../config/db");

const addSupplier = async (req, res) => {
    try {
        const { supplierId, supplierName, email, phone, supplierType, address } = req.body;
        const pool = await getPool();

        await pool.request()
            .input("supplierId", sql.NVarChar, supplierId)
            .input("supplierName", sql.NVarChar, supplierName)
            .input("email", sql.NVarChar, email)
            .input("phone", sql.NVarChar, phone)
            .input("supplierType", sql.NVarChar, supplierType)
            .input("address", sql.NVarChar, address)
            .query(`
                INSERT INTO Suppliers (SupplierId, SupplierName, Email, Phone, SupplierType, Address)
                VALUES (@supplierId, @supplierName, @email, @phone, @supplierType, @address)
            `);

        res.status(201).json({ success: true, message: "Supplier added successfully", supplierId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSuppliers = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query("SELECT * FROM Suppliers ORDER BY CreatedAt DESC");
        res.status(200).json({ success: true, count: result.recordset.length, suppliers: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Very simple supplier performance analytics: on-time products delivered vs total,
// used by the suppliers.html dashboard. Extend this once real shipment SLAs exist.
const getSupplierPerformance = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("supplierId", sql.NVarChar, req.params.supplierId)
            .query(`
                SELECT Status, COUNT(*) AS Total
                FROM Products
                WHERE SupplierId = @supplierId
                GROUP BY Status
            `);
        res.status(200).json({ success: true, breakdown: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addSupplier, getSuppliers, getSupplierPerformance };
