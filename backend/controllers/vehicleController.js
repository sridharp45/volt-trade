const User = require("../models/user");
const Vehicle = require("../models/vehicle")
const axios = require("axios");


const getVehicleInfo = async (req, res) => {
    try {
        const { vehicleId } = req.query;

        if (!vehicleId) {
            return res.status(400).json({ message: "Vehicle ID is required." });
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found." });
        }

        res.status(200).json({
            message: "Vehicle information retrieved successfully.",
            vehicle,
        });
    } catch (error) {
        console.error("Error fetching vehicle info:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


const addVehicle = async (req, res) => {
    const { userId, vehicleDomain, vehicleName, vehicleModel, batteryCapacity, currentCapacity, nickName } = req.body;

    try {
        if (!userId || !vehicleDomain || !vehicleName || !vehicleModel || !batteryCapacity || !nickName) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const newVehicle = new Vehicle({
            nickName,
            vehicleDomain,
            vehicleName,
            vehicleModel,
            batteryCapacity,
            currentCapacity,
            user: user._id
        });

        const savedVehicle = await newVehicle.save();

        user.vehicles.push(savedVehicle._id);
        await user.save();

        res.status(200).json({
            message: "Vehicle added successfully.",
            vehicle: savedVehicle
        });
    } catch (error) {
        console.error("Error adding vehicle:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const deleteVehicle = async (req, res) => {
    const { userId, vehicleId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found." });
        }

        if (!user.vehicles.includes(vehicleId)) {
            return res.status(403).json({ message: "Unauthorized to delete this vehicle." });
        }

        // let blockchainResponse;
        // try {
        //     blockchainResponse = await axios.post(
        //         `${process.env.BLOCKCHAIN_API_URL}/transactions/check`,
        //         { vehicleId }
        //     );
        // } catch (err) {
        //     return res.status(500).json({
        //         message: "Error communicating with the blockchain network.",
        //     });
        // }
        //
        // // If past transactions exist, prevent deletion
        // if (blockchainResponse.data.hasTransactions) {
        //     return res.status(400).json({
        //         message: "Cannot delete vehicle with past transactions.",
        //     });
        // }
        //
        // try {
        //     await axios.post(
        //         `${process.env.BLOCKCHAIN_API_URL}/transactions/delete`,
        //         { vehicleId }
        //     );
        // } catch (err) {
        //     return res.status(500).json({
        //         message: "Error deleting blockchain transaction data.",
        //     });
        // }

        await Vehicle.findByIdAndDelete(vehicleId);

        user.vehicles = user.vehicles.filter(vId => vId.toString() !== vehicleId);
        await user.save();

        res.status(200).json({
            message: "Vehicle and related blockchain data deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getVehicleInfo, addVehicle, deleteVehicle }