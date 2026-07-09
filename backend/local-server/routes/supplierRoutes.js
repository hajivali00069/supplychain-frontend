const express = require("express");
const router = express.Router();
const {
    addSupplier, getSuppliers, getSupplierPerformance
} = require("../controllers/supplierController");

router.post("/", addSupplier);
router.get("/", getSuppliers);
router.get("/:supplierId/performance", getSupplierPerformance);

module.exports = router;
