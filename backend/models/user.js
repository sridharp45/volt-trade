const mongoose = require("mongoose");
const vehicle = require("./vehicle")
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    organization: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: false,
        default: 1000000
    },
    icon: {
        type: String,
        required: false,
    },
    vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
