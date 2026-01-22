const Transaction = require("../models/transaction");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Trade = require("../models/trade");
const { exec } = require('child_process');
const path = require('path');
const config = require('../config');

const useBlockchainAPI = config.useBlockchainAPI;


exports.initiateTransaction = async (req, res) => {
    try {
        const tradeId = req.query.tradeId;

        if (!tradeId) {
            return res.status(400).json({ message: "Trade ID is required." });
        }

        const trade = await Trade.findById(tradeId);
        if (!trade) {
            return res.status(404).json({ message: "Trade not found." });
        }

        if (trade.state !== "accepted") {
            return res.status(400).json({ message: "Trade is not in 'accepted' state." });
        }

        const {
            typeOfTransaction,
            senderId,
            receiverId,
            senderVehicle,
            receiverVehicle,
            committedEnergy,
            credits,
            chargePerUnit,
        } = req.body;

        // Fetch current capacities of sender and receiver vehicles
        const senderVehicleData = await Vehicle.findById(senderVehicle);
        const receiverVehicleData = await Vehicle.findById(receiverVehicle);

        if (!senderVehicleData || !receiverVehicleData) {
            return res.status(404).json({ message: "Sender or receiver vehicle not found." });
        }

        const senderCurrentCapacity = senderVehicleData.currentCapacity || 0;
        const receiverCurrentCapacity = receiverVehicleData.currentCapacity || 0;
        const totalCapacity = senderVehicleData.batteryCapacity || 120; // Default battery capacity


        if (useBlockchainAPI) {

        } else {
            const transaction = new Transaction({
                typeOfTransaction,
                senderId,
                receiverId,
                senderVehicle,
                receiverVehicle,
                committedEnergy,
                credits,
                chargePerUnit,
                tradeId: trade._id,
            });

            const savedTransaction = await transaction.save();

            trade.state = "inProgress";
            trade.transactionId = transaction._id;
            await trade.save();

            res.status(200).json({
                message: "Transaction initiated.",
                transactionId: savedTransaction._id,
                transaction: savedTransaction,
            });
        }

        // Trigger Telemetry Data
        const venvPythonPath = path.resolve(__dirname, '../mqtt/venv/bin/python3'); // Go up one level to `backend/` and into `mqtt/`
        const scriptPath = path.resolve(__dirname, '../mqtt/script_mqtt.py'); // Adjust to point to `script_mqtt.py`

        const rateOfTransfer = 0.01;

        const command = `${venvPythonPath} ${scriptPath} true ${senderId} ${receiverId} ${senderCurrentCapacity} ${receiverCurrentCapacity} ${committedEnergy} ${rateOfTransfer} ${totalCapacity} ${tradeId} ${trade.transactionId} ${committedEnergy} ${chargePerUnit}`;

        console.log("Resolved Python Path:", venvPythonPath);
        console.log("Resolved Script Path:", scriptPath);

        console.log("Command to be executed:", command);

        exec(command, (error, stdout, stderr) => {
            console.log("Command executed.");
            if (error) {
                console.error(`Error running script: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Script stderr: ${stderr}`);
                return;
            }
            console.log(`Script stdout: ${stdout}`);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.preCheckTransaction = async (req, res) => {
    try {
        const {
            senderId,
            receiverId,
            senderVehicle,
            receiverVehicle,
            committedEnergy,
            chargePerUnit,
        } = req.body;

        if (!senderId || !receiverId || !senderVehicle || !receiverVehicle || !committedEnergy || !chargePerUnit) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        
        const senderVehicleData = await Vehicle.findById(senderVehicle);
        const receiverVehicleData = await Vehicle.findById(receiverVehicle);

        if (!sender || !receiver || !senderVehicleData || !receiverVehicleData) {
            return res.status(404).json({ message: "User or vehicle not found." });
        }

        const requiredEnergy = parseFloat(committedEnergy);
        const requiredMoney = requiredEnergy * chargePerUnit;
        console.log("senderVehicleData.energyAvailable:", senderVehicleData.currentCapacity);
        console.log("receiver.balance:", receiver.balance);

        if (useBlockchainAPI) {

        } else {
            if (senderVehicleData.energyAvailable < requiredEnergy) {
                return res.status(400).json({
                    message: "Sender does not have enough energy available.",
                    available_energy: senderVehicleData.currentCapacity,
                });
            }

            if (receiver.balance < requiredMoney) {
                return res.status(400).json({
                    message: "Receiver does not have enough wallet balance.",
                    available_balance: receiver.balance,
                    required_balance: requiredMoney,
                });
            }

            res.status(200).json({
                message: "Pre-check successful. Sender has enough energy, and receiver has enough money.",
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateTransactionStats = async (req, res) => {
    try {
        const { transactionId } = req.query;
        const { tradeId } = req.query;
        const { transferredEnergy, transactionStatus, chargePerUnit } = req.body;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found." });
        }

        const trade = await Trade.findById(tradeId);
        if (!trade) {
            return res.status(404).json({ message: "Trade not found." });
        }

        const sender = await User.findById(transaction.senderId);
        const receiver = await User.findById(transaction.receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "Sender or receiver not found." });
        }

        if (useBlockchainAPI) {

        } else {
            if (transactionStatus === "Completed" || transactionStatus === "Incomplete") {
                const energyCost = parseFloat(transferredEnergy) * chargePerUnit;

                if (sender.balance < energyCost) {
                    return res.status(400).json({ message: "Insufficient funds in sender's wallet." });
                }

                sender.balance += energyCost;
                receiver.balance -= energyCost;

                transaction.transferredEnergy = transferredEnergy;
                transaction.transactionStatus = transactionStatus || transaction.transactionStatus;

                trade.state = "completed";
                await trade.save();

                await sender.save();
                await receiver.save();
            } else if (transactionStatus === "Failed") {
                transaction.transactionStatus = "Failed";
            }

            transaction.updatedAt = new Date();
            const updatedTransaction = await transaction.save();

            res.status(200).json({
                message: `Transaction updated with status: ${transactionStatus}.`,
                transaction: updatedTransaction,
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactionHistoryByUser = async (req, res) => {
    try {
        const { userId } = req.query;

        if (useBlockchainAPI) {

        } else {
            const transactions = await Transaction.find({
                $or: [{ senderId: userId }, { receiverId: userId }],
                transactionStatus: { $ne: "InProgress" },
            }).populate("senderId receiverId senderVehicle receiverVehicle");

            if (!transactions || transactions.length === 0) {
                return res.status(404).json({ message: "No transactions found for this user." });
            }

            res.status(200).json({
                message: "Transactions fetched successfully.",
                transactions: transactions,
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        if (useBlockchainAPI) {

        } else {
            const transactions = await Transaction.find()
                .populate("senderId receiverId senderVehicle receiverVehicle")
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: "All transactions fetched successfully.",
                transactions: transactions,
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { transactionId } = req.query;
        const updatedFields = req.body;

        if (useBlockchainAPI) {

        } else {
            const transaction = await Transaction.findById(transactionId);
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found." });
            }

            for (const [key, value] of Object.entries(updatedFields)) {
                if (transaction[key] !== undefined) {
                    transaction[key] = value;
                }
            }

            const updatedTransaction = await transaction.save();

            res.status(200).json({
                message: "Transaction updated successfully.",
                transaction: updatedTransaction,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating transaction.", error: error.message });
    }
};

