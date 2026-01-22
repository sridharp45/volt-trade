const Ticket = require("../models/ticket");
const User = require("../models/user");


const createTicket = async (req, res) => {
    try {
        const { userId, query, response } = req.body;

        const newTicket = new Ticket({
            userId,
            query,
            response
        });

        await newTicket.save();

        res.status(200).json({ message: "Ticket created successfully", ticket: newTicket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating ticket", error: error.message });
    }
};

const getTicketById = async (req, res) => {
    try {
        const { userId } = req.query;

        const tickets = await Ticket.find({ userId }).sort({ createdTime: -1 }); // 1 for ascending order, -1 for descending order

        res.status(200).json({ tickets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching tickets", error: error.message });
    }
};


const getAllTickets = async (req, res) => {
    try {
        const tickets= await Ticket.find();

        ticketsWithUserNames = await Promise.all(tickets.map(async (ticket) => {
            const user = await User.findById(ticket.userId);
            return {
                ...ticket.toObject(),
                username: user ? user.username : null,
            };
        }));

        res.status(200).json({ ticketsWithUserNames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching tickets", error: error.message });
    }
};

const updateTicket = async (req, res) => {
    try {
        const { ticketId } = req.query;
        const { response } = req.body;

        // Find the ticket by ID
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found." });
        }

        // Update the ticket's response and timestamp
        ticket.response = response;
        ticket.updatedAt = new Date();
        const updatedTicket = await ticket.save();

        res.status(200).json({
            message: "Ticket updated successfully.",
            ticket: updatedTicket,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating ticket.", error: error.message });
    }
};

module.exports = { createTicket, getTicketById, getAllTickets, updateTicket };
