import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserDetails, setTrade, updateTransactionStats, toggleSnackbar } from "../../Redux/Actions";
import { Typography, Grid, Box, LinearProgress, Snackbar, Alert, keyframes } from "@mui/material";
// import BoltIcon from "@mui/icons-material/Bolt";
import Navbar from "../Shared/Navbar/Navbar";
import mqtt from 'mqtt';
import './Charging.css';

import ElectricCarImage from "./EVIcon.png";
// import HomeGridImage from "./HomeIcon.png";
import CarIllustration from "./CarIllu.png";
import { Zap } from 'lucide-react';

const sampleMessage = {
  sender: {
    id: "678ac8518e3730eb37696b37",
    energy: 47.02635364830977,
    voltage: 230,
    current: 0.00004347826086956522,
    power: 0.0036098881739079804,
    battery_temp: 30.00360988817391,
    charge_percentage: 39.188628040258145,
    status: "sending",
  },
  receiver: {
    id: "678d5a27625319c5d0107c54",
    energy: 52.97364635169023,
    voltage: 230,
    current: 0.00004347826086956522,
    power: 0.0036098881739079804,
    battery_temp: 30.003008240144922,
    charge_percentage: 44.144705293075184,
    status: "receiving",
  },
  progress_percent: 2.24,
  status: "inProgress",
  timestamp: 1737672814.249024,
};

const VehicleToHomeCharging = (props) => {
  const [message, setMessage] = useState(sampleMessage);
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const history = useNavigate();
  const url = "ws://localhost:8084/mqtt";
  const [tradeId, setTradeId] = useState();

  const { userDetails, tradeRow, setTrade } = props;

  useEffect(() => {
    if (tradeRow && tradeRow._id) {
      setTradeId(tradeRow._id);
    }
  }, [tradeRow]);

  useEffect(() => {
    if (!url || !tradeId) {
      console.log("Waiting for URL and tradeId...");
      return;
    }

    console.log("Connecting to MQTT broker...");
    let client;
    try {
      client = mqtt.connect(url);

      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client.subscribe(`telemetry/${localStorage.getItem("tradeId")}/`, (err) => {
          if (!err) {
            console.log(`Subscribed to telemetry/${tradeId}/`);
          } else {
            console.error('Subscription error:', err);
          }
        });
      });

      client.on('message', (topic, msg) => {
        const msgObj = JSON.parse(msg.toString());
        setMessage(msgObj);
        console.log(msgObj);
        if (msgObj.status === "completed") {
          // triggerUpdateTransaction();
          setShowPopup(true); // Show the popup
          setTimeout(() => {
            setTrade({});
            setShowPopup(false); // Hide the popup after 2 seconds
            history("/transactions/past"); // Redirect to past transactions page
          }, 2000);
        }
      });

      client.on('error', (err) => {
        console.error('MQTT error:', err);
      });
    } catch (error) {
      console.error('Error connecting to MQTT broker:', error);
    }

    return () => {
      if (client) {
        console.log("Disconnecting from MQTT broker...");
        client.end();
      }
    };
  }, [url, tradeId]);

  const triggerUpdateTransaction = () => {
    if (tradeRow.state !== "inProgress" || !tradeRow.transactionId) {
      props.toggleSnackbar({ open: true, message: 'Invalid transactionId', status: false });
      return;
    }
    props.updateTransactionStats({ params: { transactionId: tradeRow?.transactionId, tradeId: tradeRow._id }, data: { transactionStatus: "Completed", transferredEnergy: tradeRow?.energy, chargePerUnit: tradeRow?.chargePerUnit } }).then((response) => {
      if (response.payload.status === 200) {
        props.toggleSnackbar({ open: true, message: 'Transaction completed', status: true });
        setTrade({});
      }
    });
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Vehicle-to-Vehicle Charge Transfer
        </Typography>

        <Typography variant="body2" style={{ margin: "0.3rem" }}>
          Transfer Status: {message.status}
        </Typography>
        <Typography variant="body2" style={{ margin: "0.3rem 0.3rem 1.5rem" }}>
          Timestamp: {new Date(message.timestamp * 1000).toLocaleString()}
        </Typography>

        <Grid container spacing={3} justifyContent="center" alignItems="center">
          {/* Sender (Vehicle) */}
          <Grid item xs={12} sm={5}>
            <Box
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <img src={CarIllustration} alt="Electric Vehicle" style={{ height: "200px", marginBottom: '1rem' }} />
              <Typography variant="subtitle1">Sender (Vehicle)</Typography>
              {message && (
                <>
                  <Typography variant="body2" color="textSecondary">
                    Charge Level: {message?.sender?.charge_percentage?.toFixed(2)}%
                  </Typography>
                </>
              )}
              <LinearProgress
                variant="determinate"
                value={message ? message?.sender?.charge_percentage : 0}
                sx={{
                  width: '100%',
                  mt: 1,
                  height: '8px',
                  borderRadius: '4px',
                  bgcolor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#3b82f6'
                  }
                }}
              />
              {/* Telemetry Box */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  width: '100%'
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Energy: {message?.sender?.energy?.toFixed(2)} kWh
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Power: {message?.sender?.power?.toFixed(4)} kWh
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Voltage: {message?.sender?.voltage || 'N/A'} V
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Current: {(message?.sender?.current*100000).toFixed(2) || 'N/A'} µA
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Temperature: {message?.sender?.battery_temp?.toFixed(4) || 'N/A'} °C
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={2} style={{ textAlign: "center" }}>
            {message.progress_percent !== undefined && (
                          <div style={{
                            width: '100%',
                            '@media (min-width: 768px)': {
                              width: '33.333333%'
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'relative',
                              width: '100%',
                              padding: '1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '1.5rem'
                            }}>
                              <div style={{
                                width: '100%',
                                textAlign: 'center'
                              }}>
                                <div style={{
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  color: '#3b82f6',
                                  marginBottom: '0.5rem',
                                  textShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                                }}>{message.progress_percent.toFixed(2)}% Complete</div>
                                <div style={{
                                  height: '0.5rem',
                                  background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #22c55e 100%)',
                                  borderRadius: '9999px',
                                  boxShadow: '0 0 15px rgba(96, 165, 250, 0.5)',
                                  animation: 'glow 1.5s ease-in-out infinite'
                                }} />
                              </div>
              
                              <div style={{
                                position: 'relative',
                                width: '3rem',
                                height: '3rem',
                                marginTop: '0.5rem'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  inset: '-0.5rem',
                                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
                                  borderRadius: '50%',
                                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }} />
                                <div style={{
                                  position: 'absolute',
                                  inset: '-1rem',
                                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)',
                                  borderRadius: '50%',
                                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.5s'
                                }} />
                                <Zap style={{
                                  width: '2rem',
                                  height: '2rem',
                                  color: '#3b82f6',
                                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
                                  animation: 'float 3s ease-in-out infinite',
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)'
                                }} />
                              </div>
              
                              <p style={{
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                animation: 'fadeInOut 2s ease-in-out infinite',
                                marginTop: '-0.5rem'
                              }}>Charging in progress...</p>
                            </div>
                            <style>
                              {`
                                @keyframes pulse {
                                  0%, 100% { transform: scale(1); opacity: 1; }
                                  50% { transform: scale(1.1); opacity: 0.5; }
                                }
                                @keyframes float {
                                  0%, 100% { transform: translate(-50%, -60%); }
                                  50% { transform: translate(-50%, -40%); }
                                }
                                @keyframes glow {
                                  0%, 100% { opacity: 1; }
                                  50% { opacity: 0.7; }
                                }
                                @keyframes fadeInOut {
                                  0%, 100% { opacity: 1; }
                                  50% { opacity: 0.5; }
                                }
                              `}
                            </style>
                          </div>
            )}
          </Grid>

          {/* Receiver (Vehicle) */}
          <Grid item xs={12} sm={5}>
            <Box
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '2rem',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <img src={ElectricCarImage} alt="Home Grid" style={{ height: "200px", marginBottom: '1rem' }} />
              <Typography variant="subtitle1">Receiver (Vehicle)</Typography>
              {message && (
                <>
                  <Typography variant="body2" color="textSecondary">
                    Charge Level: {message?.receiver?.charge_percentage?.toFixed(2)}%
                  </Typography>
                </>
              )}
              <LinearProgress
                variant="determinate"
                value={message ? message?.receiver?.charge_percentage : 0}
                sx={{
                  width: '100%',
                  mt: 1,
                  height: '8px',
                  borderRadius: '4px',
                  bgcolor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#22c55e'
                  }
                }}
              />
              {/* Telemetry Box */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  width: '100%'
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Energy: {message?.receiver?.energy?.toFixed(2)} kWh
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Power: {message?.receiver?.power?.toFixed(4)} kWh
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Voltage: {message?.receiver?.voltage || 'N/A'} V
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Current: {(message?.receiver?.current*100000).toFixed(2) || 'N/A'} µA
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Temperature: {message?.receiver?.battery_temp.toFixed(4) || 'N/A'} °C
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </div>

      {/* Popup for transaction completion */}
      <Snackbar
        open={showPopup}
        autoHideDuration={2000}
        onClose={() => setShowPopup(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Transaction completed successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.isLoading,
  error: state.error,
  data: state.data,
  userDetails: state.userDetails,
  tradeRow: state.tradeRow,
});

const mapDispatchToProps = {
  getUserDetails,
  setTrade,
  updateTransactionStats,
  toggleSnackbar,
};

export default connect(mapStateToProps, mapDispatchToProps)(VehicleToHomeCharging);