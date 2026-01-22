const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    response: {
        type: String,
        default: ""
    },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket