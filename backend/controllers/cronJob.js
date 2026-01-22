const cron = require('node-cron');
const Trade = require('../models/trade');
const Vehicle = require('../models/vehicle');
const User = require('../models/user');
const Transaction = require('../models/transaction');


const triggerScheduledJobs = async() => {
    const now = new Date();
    now.setSeconds(0, 0);
    console.log("UTC time: ", now.toISOString())

    const trades = await Trade.find({
        typeOfPost: 2,
        executionTime: { $lte: now.toISOString() },
        state: "accepted"
    });
    console.log(`Found ${trades.length} trades to process`);

    for (const trade of trades) {
        try {
            console.log(`Processing vehicle-grid transfer for trade ID: ${trade._id}`);

            const vehicle = await Vehicle.findById(trade.vehicleId._id);
            const user = await User.findById(trade.userId);

            if (!vehicle || !user) {
                console.log(`Trade ${trade._id}: Vehicle or User not found.`);
                continue;
            }

            const requiredEnergy = trade.energy;
            const totalCost = requiredEnergy * trade.chargePerUnit;

            // Pre-check for Buy or Sell scenario
            if (trade.typeOfOrder === "Buy") {
                if (user.balance < totalCost) {
                    console.log(`Trade ${trade._id}: Insufficient balance for Buy.`);
                    continue;
                }
            } else if (trade.typeOfOrder === "Sell") {
                if (vehicle.energyAvailable < requiredEnergy) {
                    console.log(`Trade ${trade._id}: Insufficient energy for Sell.`);
                    continue;
                }
            }

            // Initiate Transaction
            const transaction = new Transaction({
                typeOfTransaction: 2,
                senderId: trade.typeOfOrder === "Sell" ? trade.userId : null,
                receiverId: trade.typeOfOrder === "Buy" ? trade.userId : null,
                senderVehicle: trade.typeOfOrder === "Sell" ? vehicle._id : null,
                receiverVehicle: trade.typeOfOrder === "Buy" ? vehicle._id : null,
                committedEnergy: requiredEnergy,
                chargePerUnit: trade.chargePerUnit,
                credits: totalCost,
                tradeId: trade._id
            });

            const savedTransaction = await transaction.save();

            trade.state = "inProgress";
            trade.transactionId = savedTransaction._id;
            await trade.save();

            console.log(`Trade ${trade._id}: Transaction initiated.`);

            // Update transaction after 1 minute
            setTimeout(async () => {
                try {
                    const transactionToUpdate = await Transaction.findById(savedTransaction._id);

                    if (trade.typeOfOrder === "Buy") {
                        user.balance -= totalCost;
                        vehicle.energyAvailable += requiredEnergy;
                    } else if (trade.typeOfOrder === "Sell") {
                        user.balance += totalCost;
                        vehicle.energyAvailable -= requiredEnergy;
                    }

                    transactionToUpdate.transactionStatus = "Completed";
                    transactionToUpdate.transferredEnergy = requiredEnergy;
                    trade.state = "completed";

                    await user.save();
                    await vehicle.save();
                    await transactionToUpdate.save();
                    await trade.save();

                    console.log(`Trade ${trade._id}: Transaction completed.`);
                } catch (error) {
                    console.error(`Error updating transaction for trade ${trade._id}:`, error);
                }
            }, 60000); // 1 minute delay

        } catch (error) {
            console.error(`Error processing trade ${trade._id}:`, error);
        }
    }

};

// Cron job running every minute to check for due trades
cron.schedule('* * * * *', () => {
    try {
        console.log("Running scheduled trade job check...");
        triggerScheduledJobs()
    } catch (error) {
        console.error("Error during cron job execution:", error);
    }
});
