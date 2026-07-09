const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const productRoutes = require("./routes/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const verifyRoutes = require("./routes/verifyRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/verify", verifyRoutes);

app.get("/", (req, res) => {
    res.send("Supply Chain Transparency Platform API is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Local API server running on http://localhost:${PORT}`);
    console.log(`   (This mirrors the logic in backend/azure-functions for local testing)`);
});
