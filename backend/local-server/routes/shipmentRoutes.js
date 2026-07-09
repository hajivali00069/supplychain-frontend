const express = require("express");
const router = express.Router();
const {
    addShipmentEvent, getShipmentEvents
} = require("../controllers/shipmentController");

router.post("/", addShipmentEvent);
router.get("/:productId", getShipmentEvents);

module.exports = router;
