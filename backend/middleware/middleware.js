const axios = require('axios'),
  config = require('../config'),
  model = require('../model/model'),
  jwt = require('jsonwebtoken');

exports.errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send({ error: 'Oops! Something went wrong!', message: err?.response?.data?.data });
};

exports.log = (req, res, next) => {
  console.info(`\n${req.method || ''} ${req.originalUrl || ''} ${res.statusCode || ''} ${res.statusMessage || ''}`);
  next();
};

exports.validateToken = async (req, res, next) => {
  const referer = req.headers.referer;
  let useAuthorization = false;
  if (referer) {
    if (referer?.includes("/dev/")) {
      useAuthorization = true;
    } else if (referer?.includes("//localhost")) {
      let token = req.headers.authorization?.split(' ')[0];
      if (token === "Bearer") {
        useAuthorization = true;
        checkOTPVerification = false;
      } else if (token === "Basic") {
        next();
        return;
      } else {
        return res.status(401).json({
          error: `Token expired or invalid`,
          status: 401
        });
      }
    }
  } else {
    return res.status(401).json({
      error: `Invalid request`,
      status: 401
    });
  }
  if (useAuthorization && req.headers.authorization) {
    let refreshToken = req.headers.authorization.split(' ')[1];
    try {
      let secret = config.jwtSecret;
      let refreshResult = jwt.verify(refreshToken, secret);
      
      let userDetails = await model.UserDetails.findOne({ userId: refreshResult.userId });
      if (!userDetails) {
        return res.status(401).json({
          error: 'User not found',
          status: 401
        });
      }
      let accessResult = jwt.verify(userDetails.accessToken, secret);
      req.decoded = accessResult;
      let payload = { userId: accessResult.userId };
      let accessTokenOptions = config.accessTokenSetup;
      const accessToken = jwt.sign(payload, secret, accessTokenOptions);
      userDetails.accessToken = accessToken;
      await userDetails.save();
    } catch (err) {
      res.status(401).json({
        error: `Token expired or invalid.`,
        status: 401
      });
    }
  } else if (!useAuthorization && req.headers.cookie && req.headers.cookie.includes('MYSAPSSO2')) {
    console.log('inside cookie check');
    next();
  } else {
    res.status(401).json({
      error: `Authentication error. Token or cookie required.`,
      status: 401
    });
  }
};

// Middleware to verify JWT
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Extract token from "Bearer <token>"
    if (!token) return res.status(401).json({ message: 'Token missing, authorization denied' });

    // Verify token
    const ans = jwt.verify(token, config.jwtSecret)
    req.decoded = ans;
    next();
};

