const { sql, getPool } = require("../config/db");
const ledgerService = require("../services/ledgerService");
const qrService = require("../services/qrService");

// Create a product, generate its QR code, and write the "Created" event
// to the ledger service (Azure Confidential Ledger in Phase 2).
const addProduct = async (req, res) => {
    try {
        const {
            productId, productName, batchNumber, supplierId,
            manufacturingDate, expiryDate
        } = req.body;

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

        const qrCodeUrl = await qrService.generateQrCode(productId);

        await pool.request()
            .input("productId", sql.NVarChar, productId)
            .input("qrCodeUrl", sql.NVarChar, qrCodeUrl)
            .query(`UPDATE Products SET QrCodeUrl = @qrCodeUrl WHERE ProductId = @productId`);

        const ledgerResult = await ledgerService.recordEvent(productId, "Created", req.body);

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            productId,
            qrCodeUrl,
            ledger: ledgerResult
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query("SELECT * FROM Products ORDER BY CreatedAt DESC");
        res.status(200).json({ success: true, count: result.recordset.length, products: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("productId", sql.NVarChar, req.params.productId)
            .query("SELECT * FROM Products WHERE ProductId = @productId");

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const history = await ledgerService.getHistory(req.params.productId);

        res.status(200).json({ success: true, product: result.recordset[0], history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update status (e.g. Manufactured -> In Transit -> Delivered) and write the
// change to the ledger. This is the hook where an Azure Function / smart
// contract style automation (e.g. auto-release payment on "Delivered") plugs in.
const updateProduct = async (req, res) => {
    try {
        const { status } = req.body;
        const { productId } = req.params;

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
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const ledgerResult = await ledgerService.recordEvent(productId, "StatusChange", { productId, status });

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: result.recordset[0],
            ledger: ledgerResult
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addProduct, getProducts, getProductById, updateProduct };
