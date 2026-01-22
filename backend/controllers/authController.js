const User = require("../models/user");
const axios = require("axios");
const bcrypt = require("bcrypt");
const config = require('../config');

const useBlockchainAPI = config.useBlockchainAPI;


const signup = async (req, res) => {
    const { username, email, password, phone, organization, balance } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            organization,
            balance,
        });

        const savedUser = await newUser.save();
        console.log(" saved user in mongo", savedUser)


        if (useBlockchainAPI) {
            // let response;
            // try {
            //     response = await axios.post(`${process.env.BLOCKCHAIN_API_URL}/users/login`, {
            //         email: user.email,
            //         orgName: user.organization,
            //     });
            // } catch (err) {
            //     return res.status(500).json({
            //         message: "Error communicating with the blockchain network.",
            //     });
            // }
            //
            // const tokenId = response?.data?.message?.token;
        } else {
            const tokenId = "bharaths-token-123"
            console.log("tokenId", tokenId)

            if (tokenId) {
                res.cookie('auth_token', tokenId, {
                    httpOnly: false, // Ensures the cookie is only accessible by the server
                    secure: process.env.NODE_ENV === 'production', // Set secure cookies only in production (over HTTPS)
                    maxAge: 3600000, // Cookie expiration time in milliseconds (e.g., 1 hour)
                    sameSite: 'None' // Helps protect against CSRF attacks
                });

                // Send response with a success message
                res.status(200).json({ message: "Login successful.", userId: savedUser._id, token: tokenId });
            } else {
                res.status(500).json({
                    message: "Failed to authenticate user with the blockchain network.",
                });
            }
        }

    } catch(e) {
        res.status(500).json({ message: e.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        if (useBlockchainAPI) {
            // let response;
            // try {
            //     response = await axios.post(`${process.env.BLOCKCHAIN_API_URL}/users/login`, {
            //         email: user.email,
            //         orgName: user.organization,
            //     });
            // } catch (err) {
            //     return res.status(500).json({
            //         message: "Error communicating with the blockchain network.",
            //     });
            // }
            //
            // const tokenId = response?.data?.message?.token;
        } else {
            const tokenId = "bharaths-token-123"
            console.log("tokenId", tokenId)

            if (tokenId) {
                res.cookie('auth_token', tokenId, {
                    httpOnly: false, // Ensures the cookie is only accessible by the server
                    secure: process.env.NODE_ENV === 'production', // Set secure cookies only in production (over HTTPS)
                    maxAge: 3600000, // Cookie expiration time in milliseconds (e.g., 1 hour)
                    sameSite: 'Strict' // Helps protect against CSRF attacks
                });

                // Send response with a success message
                res.status(200).json({ message: "Login successful.", userId: user._id, token: tokenId });
            } else {
                res.status(500).json({
                    message: "Failed to authenticate user with the blockchain network.",
                });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { signup, login };
