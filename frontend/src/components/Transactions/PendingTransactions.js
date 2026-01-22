import React, {useEffect, useState } from "react";
import {connect} from 'react-redux';
import { useNavigate } from "react-router-dom";
import {Link} from 'react-router-dom';
import {Tooltip, Typography} from '@mui/material';
import TransactionNavbar from "./TransactionNavbar";
import {getAcceptedTrades, getUserDetails, toggleSnackbar, cancelAcceptedTrade, preCheckTransaction, 
  initiateTransaction, updateTransactionStats, checkTrnStatus, setTrade} from '../../Redux/Actions/index'
import "./PastTransactions.css";
import car from "./charging.jpeg";
import * as utils from '../../utils/utils';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

const CurrentTransactions = (props) => {
  const [transactionFilter, setTransactionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(0);
  const userId = localStorage.getItem("userId");
  const [acceptedTrades, setAcceptedTrades] = useState([]);
  const history = useNavigate()

  const {userDetails, acceptTrades, setTrade} = props

  useEffect(() => {
    if(!userDetails)props.getUserDetails({params:{userId:localStorage.getItem("userId")}})
    props.getAcceptedTrades({params:{userId:localStorage.getItem("userId")}})
  },[])

  useEffect(()=>{
    if(utils.arrayLengthChecker(acceptTrades)){
      let trades = JSON.parse(JSON.stringify(acceptTrades));
      trades = trades.filter((item)=>item?.typeOfPost===1);
      trades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAcceptedTrades(trades);
    }
  },[acceptTrades])

  const handleButtonClick = (row) => {
    const preCheckPayload = {
      senderId : row.typeOfOrder==="Sell"?row.userId:row.acceptedUserId,
      receiverId : row.typeOfOrder==="Sell"?row.acceptedUserId:row.userId,
      senderVehicle : row.typeOfOrder==="Sell"?row.vehicleId?._id:row.acceptantVehicleId?._id,
      receiverVehicle : row.typeOfOrder==="Sell"?row.acceptantVehicleId?._id:row.vehicleId?._id,
      committedEnergy : row.energy,
      chargePerUnit : row.chargePerUnit,
    }
    if(row.state==="inProgress"){
      setTrade(row);
      localStorage.setItem("tradeId",row._id);
      history("/charging");
      // props.checkTrnStatus({data:preCheckPayload,params:{tradeId:row._id}}).then((response)=>{
      //   if(response.payload.status===200){
      //     const trnsId = response.payload?.data?.transactionId
      //       setSelectedRow(row);
      //       setLoading(true);
      //       setAnimate(true);
      //       setTimeout(() => {
      //         props.updateTransactionStats({params:{transactionId:trnsId,tradeId:row._id},data:{transactionId:trnsId,transactionStatus:"Completed",transferredEnergy:row.energy,chargePerUnit:row.chargePerUnit,senderId:preCheckPayload.senderId,receiverId:preCheckPayload.receiverId}})
      //       }, 9000);
      //       setTimeout(() => {
      //         setLoading(false);
      //         setSuccess(1);
      //         // setAnimate(false);  
      //       }, 9000);
      //   }
      // })
      return;
    }
    setSelectedRow(row);
    setLoading(true);
    setAnimate(true);
    props.preCheckTransaction({data:preCheckPayload}).then((response)=>{
      if(response.payload.status===200){
        preCheckPayload.typeOfTransaction = row.typeOfPost;
        preCheckPayload.credits = row.energy*row.chargePerUnit;
        props.initiateTransaction({data:preCheckPayload,params:{tradeId:row._id}}).then((response)=>{
          if(response.payload.status===200){
            // setTimeout(() => {
            //   props.updateTransactionStats({ params: { transactionId: trnsId, tradeId: row._id }, data: { transactionId: trnsId, transactionStatus: "Completed", transferredEnergy: row.energy, chargePerUnit: row.chargePerUnit, senderId: preCheckPayload.senderId, receiverId: preCheckPayload.receiverId } })
            // }, 9000);
            setTimeout(() => {
              setLoading(false);
              setSuccess(1);
              // setAnimate(false);  
            }, 5000);
          }
        })
      }
    })
  };

  const handleDeleteClick = (row) => {
    props.cancelAcceptedTrade({params:{tradeId:row._id}}).then((response)=>{
      if(response.payload.status===200){
        props.getAcceptedTrades({params:{userId:localStorage.getItem("userId")}})
      }
    })
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
      (dateFilter === "" || utils.yyyymmdd(row.date) === dateFilter)
  );



  return (
    <div>
      <TransactionNavbar />
      {loading && (
        <div className="loading-screen">
          <img style={{width:'300px'}} src={car} alt="Loading..." />
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
          </div>
          <Typography style={{fontWeight:'bold', color:'green', marginTop:'1rem'}}>Pre-Checks are in progress...</Typography>
        </div>
      )}

      { success===1 &&
        <div className="loading-screen">
        <h4>Transaction InProgress</h4>
        <p>
            Your <span style={{color: "green"}}>{selectedRow.userId===userId?selectedRow.typeOfOrder:selectedRow.typeOfOrder==="Buy"?"Sell":"Buy"}</span> transaction is in progress.
        </p>
        <p>Check {selectedRow.energy} kWh of energy transfer staus at {selectedRow.chargePerUnit?.toFixed(2)} coins/kWh in the pending transactions.</p>
        <button onClick={()=>{setAnimate(0); setSuccess(0); props.getAcceptedTrades({params:{userId:localStorage.getItem("userId")}})}}>Go to Pending Transactions</button>
      </div>
      }
      

      <div className={animate ? 'fade-out' : ''} style={{ margin: "4rem 2rem 4rem 4rem" }}>
        <div style={{display:'flex',alignItems:'center'}}>
          <h2>Pending Transactions</h2>
        </div>
        <div className="table-container">
          <table className="past-transactions-table">
            <thead>
              <tr>
                <th>Transaction Type</th>
                <th>Counter Party Name</th>
                <th>Committed Energy</th>
                <th>Charge per unit</th>
                <th>Date</th>
                <th>Time (24 hrs)</th>
                <th>Initiate</th>
              </tr>
            </thead>
            <tbody>
              {utils.arrayLengthChecker(filteredRows) ? filteredRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.userId===userId?row.typeOfOrder:row.typeOfOrder==="Buy"?"Sell":"Buy"}</td>
                  <td>{row.userId===userId?row.acceptedUsername:row.username}</td>
                  <td>{row.energy} kWh</td>
                  <td>{row.chargePerUnit?.toFixed(2)} coins/kWh</td>
                  <td>{utils.dateFormat(row.createdAt)}</td>
                  <td>{utils.timeFormat(row.createdAt)}</td>
                  <td style={{display:'flex'}}>
                    <button style={{flexGrow:1}} onClick={() => handleButtonClick(row)}>{row.state==="accepted"?'Initiate':row.state==='inProgress'?'InProgress':''}</button>
                    {row.state==="accepted" && <div style={{flexGrow:1}}>
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
      </div>
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
  checkTrnStatus,
  setTrade,
}

export default connect(mapStateToProps, mapDispatchToProps)(CurrentTransactions)