import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Navbar from "../Shared/Navbar/Navbar";
import { getUserDetails, getTransactionHistoryByUser} from "../../Redux/Actions";
import * as utils from '../../utils/utils';
import "./Wallet.css";

const Wallet = (props) => {
  const { userDetails, userTransactionHistory } = props;
  const [transactions,setTransactions] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    props.getUserDetails({
      params: { userId: localStorage.getItem("userId") },
    }).then((response)=>{
      if(response.payload.status===200){
       localStorage.setItem("userName",response?.payload?.data?.user?.username);
       localStorage.setItem("balance",response?.payload?.data?.user?.balance);
      }
    });
    props.getTransactionHistoryByUser({params:{userId:localStorage.getItem("userId")}})
  }, []);

  useEffect(() => {
    let transactions = JSON.parse(JSON.stringify(userTransactionHistory));
    transactions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    transactions=transactions.slice(0,3)
    setTransactions(transactions);
  },[userTransactionHistory])

  // const transactions = [
  //   { id: 1, date: "01 Jan 2025", type: "Sell", amount: "+500 Coins", energy: "5 kWh" },
  //   { id: 2, date: "28 Dec 2024", type: "Buy", amount: "-300 Coins", energy: "3 kWh" },
  //   { id: 3, date: "27 Dec 2024", type: "Sell", amount: "+200 Coins", energy: "2 kWh" },
  // ];

  return (
    <>
      <Navbar />
      <div className="wallet-page">
        <div className="wallet-layout">
          {/* Wallet Balance Section */}
          <div className="wallet-left">
            <div className="wallet-card">
              <h1 className="wallet-title">Your Wallet</h1>
              <div className="wallet-balance">
                <div className="wallet-amount">
                  <span>Coins:</span> <strong>{userDetails?.user?.balance?userDetails?.user?.balance?.toFixed(2):"____"} 💰</strong>
                </div>
                <div className="wallet-amount">
                  <span>Energy:</span> <strong>10 kWh ⚡</strong>
                </div>
              </div>
              <button className="wallet-action">Recharge</button>
            </div>
          </div>

          {/* Recent Transactions Section */}
          <div className="wallet-right">
            <div className="transactions-card">
              <h2 className="transactions-title">Recent Transactions</h2>
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Energy</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td>{utils.formatLocalDate(txn.updatedAt)}</td>
                      <td>{txn.senderId?._id===userId?"Sell":"Buy"}</td>
                      <td
                        style={{color:txn.senderId?._id===userId?"green":"red", fontWeight:"bold"}}
                      >
                        {`${txn.senderId?._id===userId?'+':'-'}${txn.credits?.toFixed(2)} Coins`}
                      </td>
                      <td>{txn.committedEnergy} kWh</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.isLoading,
  error: state.error,
  data: state.data,
  userDetails: state.userDetails,
  userTransactionHistory: state.userTransactionHistory,
});

const mapDispatchToProps = {
  getUserDetails,
  getTransactionHistoryByUser
};

export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
