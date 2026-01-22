const User = require("../models/user");
const Vehicle = require("../models/vehicle")
const axios = require("axios");

const getUser = async (req, res) => {
    const { userId } = req.query;

    try {
        
        const user = await User.findById(userId).populate('vehicles');

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                organization: user.organization,
                balance: user.balance,
                vehicles: user.vehicles,
                icon: user.icon,
            },
        });
    } catch (error) {
        console.error("Error retrieving user data:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const updateUser = async (req, res) => {
    const { userId, username, email, phone, organization, icon } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (organization) user.organization = organization;
        if (icon) user.icon = icon;

        await user.save();

        res.status(200).json({
            message: "User updated successfully.",
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                organization: user.organization,
                balance: user.balance,
                icon: user.icon,
                vehicles: user.vehicles,
            },
        });
    } catch (error) {
        console.error("Error updating user data:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};



const getVehicles = async (req, res) => {
    const { userId } = req.query;

    try {
        const user = await User.findById(userId).populate('vehicles');

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            message: "User vehicles retrieved successfully.",
            vehicles: user.vehicles
        });
    } catch (error) {
        console.error("Error retrieving vehicles:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getUser, updateUser, getVehicles };
