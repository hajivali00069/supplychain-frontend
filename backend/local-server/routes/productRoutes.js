const express = require("express");
const router = express.Router();
const {
    addProduct, getProducts, getProductById, updateProduct
} = require("../controllers/productController");

router.post("/", addProduct);
router.get("/", getProducts);
router.get("/:productId", getProductById);
router.put("/:productId", updateProduct);

module.exports = router;
