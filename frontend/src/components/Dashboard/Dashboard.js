import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// import { Link } from 'react-router-dom';
import Navbar from "../Shared/Navbar/Navbar";
import "./Dashboard.css";
import Chart from "chart.js/auto";
import TransactionNavbar from "../Transactions/TransactionNavbar";


 const Dashboard = () => {
  // const navigate = useNavigate();

  const [energyTradedData, setEnergyTradedData] = useState([]);
  const [transactionCountData, setTransactionCountData] = useState([]);
  const [registrationCountData, setRegistrationCountData] = useState([]);



  useEffect(() => {
    // Set the energy traded data
    const data = [50.4, 54.7, 67.2, 75.9, 79.5, 75.4, 62.1];
    setEnergyTradedData(data);

    const countData = [12, 8, 15, 10, 14, 11, 9];
    setTransactionCountData(countData);

    const registrationData = [20, 15, 18, 22, 25, 23, 19];
    setRegistrationCountData(registrationData);
  }, []);

  useEffect(() => {
    const ctx = document.getElementById("energyTradedChart");
  
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }
  
    if (ctx) {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [
            {
              label: "Energy Traded",
              data: energyTradedData,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
            x: {
              ticks: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
          },
        },
      });
    }

    const transactionCountCtx = document.getElementById("transactionCountChart");
    const existingTransactionCountChart = Chart.getChart(transactionCountCtx);
    if (existingTransactionCountChart) {
      existingTransactionCountChart.destroy();
    }

    if (transactionCountCtx) {
      new Chart(transactionCountCtx, {
        type: "bar",
        data: {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [
            {
              label: "Number of Transactions",
              data: transactionCountData,
              backgroundColor: "rgba(255, 165, 0, 0.2)", 
              borderColor: "rgba(255, 165, 0, 1)", 
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
            x: {
              ticks: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
          },
        },
      });
    }
    const registrationCountCtx = document.getElementById("registrationCountChart");

    // Destroy the existing registration count chart instance if it exists
    const existingRegistrationCountChart = Chart.getChart(registrationCountCtx);
    if (existingRegistrationCountChart) {
      existingRegistrationCountChart.destroy();
    }

    if (registrationCountCtx) {
      new Chart(registrationCountCtx, {
        type: "bar",
        data: {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [
            {
              label: "Number of New Registrations",
              data: registrationCountData,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
            x: {
              ticks: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#fff",
                font: {
                  size: 14,
                },
              },
            },
          },
        },
      });
    }
    
  }, [energyTradedData, transactionCountData, registrationCountData]);


  return (
    <div style={{backgroundColor: "#1F1D1B", paddingBottom: "50px" }}>
      <TransactionNavbar />
      <div className="chart-container" style={{ width: "66%", margin: "20px auto", border: "1px solid #fff" }}>
        <canvas id="energyTradedChart" width="400" height="200"></canvas>
      </div>

      <div className="chart-container" style={{ width: "66%", margin: "20px auto", border: "1px solid #fff" }}>
        <canvas id="transactionCountChart" width="400" height="200"></canvas>
      </div>
      <div className="chart-container" style={{ width: "66%", margin: "20px auto", border: "1px solid #fff" }}>
        <canvas id="registrationCountChart" width="400" height="200"></canvas>
      </div>

    </div>
  );
};

export default Dashboard;
