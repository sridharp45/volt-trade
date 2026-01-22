const express = require("express");
const router = express.Router();
const { getVehicleInfo, addVehicle, deleteVehicle } = require("../controllers/vehicleController");

router.post("/add", addVehicle);
router.post("/delete", deleteVehicle);
router.get("/", getVehicleInfo);

module.exports = router;