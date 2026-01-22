const mongoose = require("mongoose");
const User = require("./user");
const { Schema } = mongoose;

const vehicleSchema = new mongoose.Schema({
    nickName:{
        type: String,
        required: true
    },
    vehicleDomain: {
        type: String,
        required: true
    },
    vehicleName: {
        type: String,
        required: true
    },
    vehicleModel: {
        type: String,
        required: true
    },
    batteryCapacity: {
        type: Number,
        required: true,
        default: 120
    },
    currentCapacity: {
        type: Number,
        default: 50
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle