// ============================================================================
// QR Code Service
// ============================================================================
// Generates a QR code that points to the public verify page for a product.
// Currently saves to local disk (backend/local-server/uploads/qrcodes).
//
// PHASE 2 TODO (Azure Blob Storage):
//   1. npm install @azure/storage-blob
//   2. Instead of QRCode.toFile(), use QRCode.toBuffer() and upload the
//      buffer to a "qrcodes" container with @azure/storage-blob.
//   3. Store the returned blob URL in Products.QrCodeUrl instead of a
//      local file path.
// ============================================================================

const QRCode = require("qrcode");
const path = require("path");

const PUBLIC_VERIFY_BASE_URL = process.env.PUBLIC_VERIFY_BASE_URL || "http://localhost:5500/verify.html";

const generateQrCode = async (productId) => {
    const qrPath = path.join(__dirname, "../uploads/qrcodes", `${productId}.png`);
    const verifyUrl = `${PUBLIC_VERIFY_BASE_URL}?productId=${productId}`;

    await QRCode.toFile(qrPath, verifyUrl);

    // Local dev URL - swap this for the Blob Storage URL in Phase 2
    return `/uploads/qrcodes/${productId}.png`;
};

module.exports = { generateQrCode };
