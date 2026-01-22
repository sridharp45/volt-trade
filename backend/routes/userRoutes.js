const express = require("express");
const router = express.Router();
const { getUser, updateUser, getVehicles } = require("../controllers/userController")

router.get("/", getUser);
router.get("/vehicles", getVehicles);
router.put("/", updateUser);

module.exports = router;