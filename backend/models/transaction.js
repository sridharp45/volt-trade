const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        typeOfTransaction: { type: Number, required: true }, // 1 or 2
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        senderVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
        receiverVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
        committedEnergy: { type: Number, required: true },
        transferredEnergy: { type: Number, default: 0 },
        transactionStatus: { type: String, enum: ["Completed", "Incomplete", "InProgress", "Failed"], default: "InProgress" },
        chargePerUnit: { type: Number, required: true },
        credits: { type: Number, required: true },
        tradeId: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;