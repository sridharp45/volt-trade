import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { toggleSnackbar, getUserDetails, getTransactionHistoryByUser } from "../../Redux/Actions";
import "./Vehicle.css";
import VehicleNavbar from "./VehicleNavbar";
import * as utils from '../../utils/utils';
import vehiclesData from '../../MOCK_DATA.json';
// import { convertLength } from "@mui/material/styles/cssUtils";


const Vehicle = (props) => {
  const [date,setDate] = useState();
  const { userDetails, vehicleSelected, userTransactionHistory } = props;
  const [userVehicles, setUserVehicles] = useState({});
  const [transactions,setTransactions] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
        if(Object.keys(vehicleSelected).length===0){
            props.getUserDetails({params:{userId:localStorage.getItem("userId")}})
        }
        props.getTransactionHistoryByUser({params:{userId:localStorage.getItem("userId")}})
    },[])
    useEffect(() => { 
        const user = userDetails?.user?.vehicles? userDetails?.user?.vehicles:[];
        if(utils.arrayLengthChecker(user) && Object.keys(vehicleSelected).length===0){
            setUserVehicles(user[0]);
        }
    },[userDetails])

    useEffect(() => {
        setUserVehicles(vehicleSelected);
    },[vehicleSelected])

    useEffect(() => {
        if(userVehicles?._id===undefined || !utils.arrayChecker(userTransactionHistory))return;
        let transactions = JSON.parse(JSON.stringify(userTransactionHistory));
        transactions = transactions.filter((item)=>(item?.senderVehicle?._id===userVehicles?._id || item?.receiverVehicle?._id===userVehicles?._id));
        transactions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        transactions=transactions.slice(0,7)
        setTransactions(transactions);
    },[userVehicles,userTransactionHistory])

    // const vehicle = props.location.state?.vehicle;

    // console.log(vehicle);

  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'short' });
    const formattedDate = `${day} ${month}`;
    setDate(formattedDate);
  }, []);

  const [matchedVehicle, setMatchedVehicle] = useState(null);

  useEffect(() => {
    const match = vehiclesData.find(
        (data) =>
          data.car === userVehicles?.vehicleDomain &&
          data.car_model === userVehicles?.vehicleName
      );
      setMatchedVehicle(match);
    // console.log(match);
  }, [userVehicles]);


  return (
    <div className="dashboard">
      {/* <aside className=""> */}
      {/* </aside>x */}

      <main className="main">
        <VehicleNavbar/>
        <div style={{margin:"20px 0px -20px 40px"}}><h3>Car Details</h3></div>
        <section className="content">

          <div className="location">
            <div class="box1">
                <div class="battery">
                    <h5>Battery</h5>
                    <div class="battery-inner">
                        <div class="battery-container">
                            <div class="battery-bump"></div>
                            <div class="battery-outer"><div class="battery-level"><div>50%</div></div></div>
                        </div>
                        <div>
                            <div class="battery-text-container">
                                <div>
                                    <div class="battery-text1">{matchedVehicle?.battery_percent}%</div>
                                    <div class="battery-text2">Charge Left</div>
                                </div>
                                <div>
                                    <div class="battery-text1">{matchedVehicle?.car_current_battery} kWh</div>
                                    <div class="battery-text2">Energy Left</div>
                                </div>
                                <div>
                                    <div class="battery-text1">{matchedVehicle?.car_battery} kWh</div>
                                    <div class="battery-text2">Battery capacity</div>
                                </div>
                            </div>
                        </div>
                    </div>  
                </div>
                <div class="battery">
                    <div style={{marginBottom:"-6px"}}><h5>Station</h5></div>
                    <div style={{fontSize: "10px"}}>See location →</div>
                    <div><img src="/images/station.png" alt="Station" style={{paddingLeft:"40px",height:"125px"}}/></div>
                </div>
            </div>
            <div class="box2">
                <div><h5>Recent Car Transactions</h5></div>
                <div>
                    <table class="scrolldown">
                        <thead>
                            <tr class="trbody">
                                <th class="thtd">Energy Transfered (kWh)</th>
                                <th class="thtd">Price/kwh (Coins)</th>
                                <th class="thtd">Type</th>
                            </tr>
                        </thead>
                        <tbody class="tbody">
                            {
                                utils.arrayLengthChecker(transactions) ? transactions?.map((txn)=>(
                                    <tr class="trbody">
                                        <td class="thtd">{txn.committedEnergy}</td>
                                        <td class="thtd">{txn.chargePerUnit?.toFixed(2)}</td>
                                        <td class="thtd">{txn.senderId?._id===userId?"Sell":"Buy"}</td>
                                    </tr>
                                ))
                                :
                                    <tr> 
                                        <td colSpan="3" align="center" class="thtd">No Transactions Found</td>
                                    </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
          </div>

          <div className="car-details">
            
            <div class="car-details-content">
                <div>
                    <img src={`/images/cars/${userVehicles?.vehicleDomain}_${userVehicles?.vehicleName}.png`} alt="Car" />
                    {/* <img src={VehicleImg} alt="Car" /> */}
                </div>
                <div>
                    <h5>{userVehicles?.vehicleDomain}</h5>
                </div>
                <div>
                    <h6>{userVehicles?.vehicleName}</h6>
                </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const mapStateToProps = (state) => ({
  userDetails: state.userDetails,
  vehicleSelected: state.vehicleSelected,
  userTransactionHistory: state.userTransactionHistory,
});

const mapDispatchToProps = {
  toggleSnackbar,
  getUserDetails,
  getTransactionHistoryByUser
};

export default connect(mapStateToProps,mapDispatchToProps)(Vehicle);
