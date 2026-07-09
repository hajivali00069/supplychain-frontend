const express = require("express");
const router = express.Router();
const { verifyProduct } = require("../controllers/verifyController");

router.get("/:productId", verifyProduct);

module.exports = router;
