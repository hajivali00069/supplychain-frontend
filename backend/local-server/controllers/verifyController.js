const { sql, getPool } = require("../config/db");
const ledgerService = require("../services/ledgerService");

// Public endpoint - what verify.html calls when a customer scans a QR code
// or types in a product ID. Read-only, no auth required by design.
const verifyProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const pool = await getPool();

        const result = await pool.request()
            .input("productId", sql.NVarChar, productId)
            .query("SELECT * FROM Products WHERE ProductId = @productId");

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found - not authentic or not yet registered"
            });
        }

        const history = await ledgerService.getHistory(productId);

        res.status(200).json({
            success: true,
            authentic: true,
            product: result.recordset[0],
            verifiedEvents: history.length,
            history
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { verifyProduct };
