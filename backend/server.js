const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes")
const userRoutes = require("./routes/userRoutes")
const tradeRoutes = require("./routes/tradeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const ticketRoutes = require("./routes/ticketRoutes")

require("./controllers/cronJob");

const app = express();

const corsOptions = {
    origin: "*",
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect("mongodb+srv://primefury:Duggii%405252@info-trade.cxgh0.mongodb.net/?retryWrites=true&w=majority&appName=Info-Trade", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB Server");
    })
    .catch((err) => {
        console.error("MongoDB connection error", err);
    });

// Default Route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the application!" });
});


// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/users", userRoutes)
app.use("/api/trades", tradeRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/tickets", ticketRoutes)

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

