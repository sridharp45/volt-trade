const express = require("express");
const { cancelTrade, createTrade, getAllTrades, acceptTrade, getTradesByUser, cancelAcceptedTrade, getTradesNearby, getAcceptedTrades, editTrade } = require("../controllers/tradeController");
const router = express.Router();

router.delete("/cancel", cancelTrade);
router.post("/edit", editTrade);
router.post("/", createTrade);
router.get("/", getAllTrades);
router.put("/accept", acceptTrade);
router.get("/user", getTradesByUser);
router.put("/cancel-accepted", cancelAcceptedTrade);
router.get("/nearby", getTradesNearby);
router.get("/accepted", getAcceptedTrades);

module.exports = router;
