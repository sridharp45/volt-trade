const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    typeOfPost: { type: Number, enum: [1, 2], required: true },
    typeOfOrder: { type: String, enum: ["Buy", "Sell"], required: true },
    energy: { type: Number, required: true },
    chargePerUnit: { type: Number, required: false },
    state: { type: String, enum: ["posted", "accepted", "inProgress", "completed"], default: "posted" },
    acceptantVehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    acceptedUserId: { type: String,default: null },
    acceptedTime: { type: Date, default: null },
    selectedContract: { type: String, enum: ["Manual", "Automatic"], required: true },
    executionTime: { type: Date, default: null },
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    createdAt: { type: Date, default: Date.now },
    transactionId: { type: String, default: null },
});

tradeSchema.index({ location: "2dsphere" });

const Trade = mongoose.model("Trade", tradeSchema);

module.exports = Trade;
