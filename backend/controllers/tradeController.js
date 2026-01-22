const Trade = require("../models/trade");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");

exports.createTrade = async (req, res) => {
    try {
        const trade = new Trade(req.body);
        if(trade.typeOfPost===2) {
            trade.state = "accepted";
        }
        const savedTrade = await trade.save();

        res.status(200).json({ message: "Trade posted successfully.", trade: savedTrade });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.editTrade = async (req, res) => {
    try {
        const { tradeId } = req.query;
        const updates = req.body;

        if (!tradeId) {
            return res.status(400).json({ message: "Trade ID is required." });
        }

        const updatedTrade = await Trade.findByIdAndUpdate(
            tradeId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedTrade) {
            return res.status(404).json({ message: "Trade not found." });
        }

        res.status(200).json({
            message: "Trade updated successfully.",
            trade: updatedTrade
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getAllTrades = async (req, res) => {
    try {
        const trades = await Trade.find({ state: "posted" }).populate("vehicleId");
        res.status(200).json(trades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cancelTrade = async (req, res) => {
    try {
        const { tradeId } = req.query;

        const deletedPost = await Trade.findByIdAndDelete(tradeId);

        if (!deletedPost) {
            return res.status(404).json({ message: "Trade post not found" });
        }

        res.status(200).json({ message: "Trade post cancelled successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cancelAcceptedTrade = async (req, res) => {
    try {
        const { tradeId } = req.query;

        const tradePost = await Trade.findById(tradeId);

        if (!tradePost) {
            return res.status(404).json({ message: "Trade post not found" });
        }

        if (tradePost.state !== "accepted") {
            return res.status(400).json({ message: "Trade post is not in 'accepted' state" });
        }

        tradePost.state = "posted";
        tradePost.acceptantVehicleId = null;

        await tradePost.save();

        res.status(200).json({ message: "Trade post cancelled and reverted to 'posted' state" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.acceptTrade = async (req, res) => {
    try {
        const { tradeId } = req.query;
        const { acceptantVehicleId, acceptedUserId } = req.body;

        const trade = await Trade.findById(tradeId);

        if (!trade || trade.state !== "posted") {
            return res.status(400).json({ message: "Invalid or already accepted trade." });
        }

        trade.state = "accepted";
        trade.acceptantVehicleId = acceptantVehicleId;
        trade.acceptedUserId = acceptedUserId;
        trade.acceptedTime = new Date();

        const updatedTrade = await trade.save();

        res.status(200).json({ message: "Trade accepted successfully.", updatedTrade: updatedTrade });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAcceptedTrades = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const trades = await Trade.find({
            state: { $in: ["accepted", "inProgress"] },
            $or: [{ userId }, { acceptedUserId: userId }],
        })

        const tradesWithUsernames = await Promise.all(trades.map(async (trade) => {
            // Populate fields before converting to object
            const populatedTrade = await trade.populate("vehicleId acceptantVehicleId"); // No need for execPopulate
            const user = await User.findById(populatedTrade.userId);
            const acceptedUser = populatedTrade.acceptedUserId ? await User.findById(populatedTrade.acceptedUserId) : null;
            const vehicle = await Vehicle.findById(populatedTrade.vehicleId);

            const name = vehicle ? `${vehicle?.vehicleDomain} ${vehicle.vehicleName} ${vehicle.vehicleModel} - ${vehicle.nickName}` : null;

            return {
                ...populatedTrade.toObject(), // Convert to plain object after populating
                username: user ? user.username : null,
                acceptedUsername: acceptedUser ? acceptedUser.username : null,
                vehicleName: name,
            };
        }));


        res.status(200).json(tradesWithUsernames);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.getTradesByUser = async (req, res) => {
    try {
        const { userId } = req.query;
        const trades = await Trade.find({ userId });
        res.status(200).json(trades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getTradesNearby = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance } = req.query;

        const trades = await Trade.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    distanceField: "distance",
                    maxDistance: parseFloat(maxDistance) || 5000,
                    spherical: true,
                },
            },
            { $match: { state: "posted" } },
        ]);

        res.status(200).json(trades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};
