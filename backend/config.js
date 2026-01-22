// config.js
require('dotenv').config(); // Load environment variables from .env file

const config = {
    useBlockchainAPI: process.env.USE_BLOCKCHAIN_API === 'true',
    // Add other config variables as needed
};

module.exports = config;
