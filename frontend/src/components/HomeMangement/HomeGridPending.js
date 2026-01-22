import React, {useEffect, useRef, useState } from "react";
import {connect} from 'react-redux';
import {Link,} from 'react-router-dom';
import {Box, Grid, LinearProgress, Tooltip, Typography} from '@mui/material';
import {getAcceptedTrades, getUserDetails, toggleSnackbar, cancelAcceptedTrade, preCheckTransaction, initiateTransaction, updateTransactionStats, editTrade} from '../../Redux/Actions/index'
import "../Transactions/PastTransactions.css";
import car from "../Transactions/charging.jpeg";
import * as utils from '../../utils/utils';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import HomeManagementNavbar from "./HomeManagementNavbar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeGridImage from "../Charging/HomeIcon.png";
import CarIllustration from "../Charging/CarIllu.png";

const HomePendingRequest = (props) => {
  const [transactionFilter, setTransactionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [success, setSuccess] = useState(0);
  const userId = localStorage.getItem("userId");
  const [acceptedTrades, setAcceptedTrades] = useState([]);
  const [editTradeId, setEditTradeId] = useState("");
  const [time, setTime] = useState("");
  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState(10);
  const progressRef = useRef(() => {});
  const [isLoading, setIsLoading] = useState(false);

  const {userDetails, acceptTrades} = props

  useEffect(() => {
    if(!userDetails.user)props.getUserDetails({params:{userId:localStorage.getItem("userId")}})
    props.getAcceptedTrades({params:{userId:localStorage.getItem("userId")}})
  },[])

  useEffect(()=>{
    if(utils.arrayLengthChecker(acceptTrades)){
      let trades = JSON.parse(JSON.stringify(acceptTrades));
      trades = trades.filter((item)=>item?.typeOfPost===2);
      trades.sort((a, b) => new Date(b.executionTime) - new Date(a.executionTime));
      setAcceptedTrades(trades);
    }
  },[acceptTrades])

  useEffect(() => {
    if (!isLoading) return;

    const timer = setInterval(() => {
      progressRef.current();
    }, 100);
    return () => {
      clearInterval(timer);
    };
  }, [isLoading]);

  useEffect(() => {
    progressRef.current = () => {
      if (progress === 100) {
        setProgress(0);
        setBuffer(10);
        setIsLoading(false);
        window.location.reload();
      } else {
        setProgress((prevProgress) => prevProgress + 1);
        if (buffer < 100 && progress % 5 === 0) {
          setBuffer((prevBuffer) => {
            const newBuffer = prevBuffer + 1 + Math.random() * 10;
            return newBuffer > 100 ? 100 : newBuffer;
          });
        }
      }
    };
  }, [progress, buffer]);

  const handleButtonClick = (row) => {
    if(row.state==="inProgress"){
      setSelectedRow(row);
      setProgress(0);
      setBuffer(10);
      setIsLoading(true);
      return;
    }
    if(editTradeId!==row._id){
      setEditTradeId(row._id);
      return;
    }
    if(time===""){
      props.toggleSnackbar({open:'true',message:'Please Enter the Time of execution',status:false});
      return;
    }
    const payload = {
      executionTime:time,
      chargePerUnit:utils.calculateTariff(new Date(time)).toFixed(2)
    }
    props.editTrade({params:{tradeId:row._id},data:payload}).then((response)=>{
      if(response.payload.status===200){
        setEditTradeId("");
        setTime("");
        props.getAcceptedTrades({params:{userId:localStorage.getItem("userId")}});
      }
    })
  };

  const handleTimeChange = (e) => {
    const selectedTime = new Date(e.target.value);
    const currentTime = new Date();

    if (selectedTime > currentTime) {
      setTime(e.target.value);
    } else {
      props.toggleSnackbar({open:'true',message:"Please select a date and time in the future.",status:false});
    }
}

  const handleDeleteClick = (row) => {
    props.cancelAcceptedTrade({params:{tradeId:row._id}}).then((response)=>{
      if(response.payload.status===200){
        props.getAcceptedTrades({params:{userId:localStorage.getItem("userId")}})
      }
    })
  }

  const handleClearEdit = (row) => {
    setEditTradeId("");
    setTime("");
  }

  const rows = [
    {
      transaction: "Buy",
      name: "Inga",
      price: 90,
      committedEnergy: 100,
      date: "2025-01-01",
    },
    {
      transaction: "Sell",
      name: "Helena",
      committedEnergy: 200,
      price: 180,
      date: "2025-01-02",
    },
    {
      transaction: "Buy",
      name: "Hans",
      price: 150,
      committedEnergy: 150,
      date: "2025-01-03",
    },
    {
      transaction: "Sell",
      name: "Anna",
      price: 250,
      committedEnergy: 250,
      date: "2025-01-04",
    },
  ];

  const filteredRows = acceptedTrades.filter(
    (row) =>
      (transactionFilter === "All" || (row.userId===userId?row.typeOfOrder:row.typeOfOrder==="Buy"?"Sell":"Buy") === transactionFilter) &&
      (statusFilter === "All" || row.status === statusFilter) &&
      (dateFilter === "" || row.date === dateFilter)
  );



  return (
    <div>
      {!isLoading && <HomeManagementNavbar />}
      {isLoading && (
        <div style={{display:'flex',alignItems:'center', justifyContent:'space-around', height:'100vh'}}>
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
            {selectedRow.typeOfOrder === "Sell" ? <img src={CarIllustration} alt="Electric Vehicle" style={{ height: "200px", marginBottom: '1rem' }} /> : <img src={HomeGridImage} alt="Home Grid" style={{ height: "200px", marginBottom: '1rem' }} />}
            <Typography variant="subtitle1">Sender ({selectedRow.typeOfOrder === "Sell"?"Vehicle":"Home Grid"})</Typography>
          </Box>
          <Box sx={{ width: '40%', marginTop: 2 }}>
            <Typography width='100%' color="success" sx={{textAlign:'center',fontWeight:'bold'}}>INPROGRESS</Typography>
            <LinearProgress variant="buffer" value={progress} valueBuffer={buffer} color="success" width='100%'/>
            <Typography width='100%' color="success" sx={{textAlign:'center'}}>{progress}%</Typography>
          </Box>
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
            {selectedRow.typeOfOrder === "Buy" ? <img src={CarIllustration} alt="Electric Vehicle" style={{ height: "200px", marginBottom: '1rem' }} /> : <img src={HomeGridImage} alt="Home Grid" style={{ height: "200px", marginBottom: '1rem' }} />}
            <Typography variant="subtitle1">Receiver ({selectedRow.typeOfOrder === "Buy"?"Vehicle":"Home Grid"})</Typography>
          </Box>
        </div>
      )}

      { success===1 &&
        <div className="loading-screen">
        <h4>Transaction Complete</h4>
        <p>
            Your <span style={{color: "green"}}>{selectedRow.userId===userId?selectedRow.typeOfOrder:selectedRow.typeOfOrder==="Buy"?"Sell":"Buy"}</span> transaction has been completed successfully.
        </p>
      <p>{selectedRow.energy} kWh of energy transferred at {selectedRow.chargePerUnit?.toFixed(2)} coins/kWh.</p>
        <button><Link to="/transactions/past">Close</Link></button>

      </div>
      }
      

      {!isLoading &&<div className={animate ? 'fade-out' : ''} style={{ margin: "4rem 2rem 4rem 4rem" }}>
        <h2>Pending Transactions</h2>
        <div className="table-container">
          <table className="past-transactions-table">
            <thead>
              <tr>
                <th>Transaction Type</th>
                <th>Vehicle Name</th>
                <th>Committed Energy</th>
                <th>Execution Date</th>
                <th>Contract type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {utils.arrayLengthChecker(filteredRows) ? filteredRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.userId===userId?row.typeOfOrder:row.typeOfOrder==="Buy"?"Sell":"Buy"}</td>
                  <td>{row?.vehicleName}</td>
                  <td>{row?.energy} kWh</td>
                  {editTradeId===row._id?
                    <td>
                      <input
                        size='large'
                        type="datetime-local"
                        id="time"
                        name="time"
                        value={time}
                        style={{ marginLeft: '1rem' }}
                        onChange={(e) => { handleTimeChange(e) }}
                        required
                      />
                    </td>
                    :
                    <td>{utils.dateFormat2(row?.executionTime)}</td>
                  }
                  <td>{row?.selectedContract}</td>
                  <td style={{display:'flex'}}>
                    {row.state==="accepted" && editTradeId===row._id && <div style={{flexGrow:1}}>
                      <Tooltip title="back">
                        <ArrowBackIcon style={{ cursor:'pointer'}} onClick={() => handleClearEdit(row)}/>
                      </Tooltip>
                    </div>
                    }
                    <button style={{flexGrow:1}} onClick={() => handleButtonClick(row)}>{editTradeId===row._id?'Save':row.state==='accepted'?'Edit':row.state==='inProgress'?'Inprogress':''}</button>
                    {row.state==="accepted" && editTradeId!==row._id && <div style={{flexGrow:1}}>
                      <Tooltip title="backoff trade">
                        <DeleteForeverOutlinedIcon style={{color:'red', cursor:'pointer'}} onClick={() => handleDeleteClick(row)}/>
                      </Tooltip>
                    </div>}
                  </td>
                </tr>
              ))
              :
              <tr>
                <td colSpan="7">No Active Accepted Trades</td>
              </tr>
            
            }
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.isLoading,
  userDetails: state.userDetails,
  allTrades:state.allTrades,
  acceptTrades:state.acceptTrades,
})

const mapDispatchToProps =  {
  toggleSnackbar,
  getUserDetails,
  getAcceptedTrades,
  cancelAcceptedTrade,
  preCheckTransaction,
  initiateTransaction,
  updateTransactionStats,
  editTrade
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePendingRequest)