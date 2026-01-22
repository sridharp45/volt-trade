import React, { useState, useEffect } from 'react'
import {connect} from 'react-redux';
import {toggleSnackbar,getUserDetails, createPost} from '../../Redux/Actions';
import TransactionNavbar from '../Transactions/TransactionNavbar'
import * as utils from '../../utils/utils';

const NewTransaction = (props) => {
  const [transactionType, setTransactionType] = useState("");
  const [transactionStatus, setTransactionStatus] = useState(false);
  const [availableEnergy, setAvailableEnergy] = useState("");
  const [biddingAmount, setBiddingAmount] = useState("");
  const [requiredEnergy, setRequiredEnergy] = useState("");
  const [maxPrice, setMaxPrice] = useState("")
  const [vehicles,setVehicles] = useState([]);
  const [vehicleSelected,setVehicle] = useState("");
  const [location, setLocation] = useState({latitude:"",longitude:""})
  const [vehicleCap,setVehicleCap] = useState(0);
  const {userDetails} = props;

  useEffect(() => {
    if(!userDetails.user)props.getUserDetails({params:{userId:localStorage.getItem("userId")}})
    if(userDetails?.user?.vehicles){
      setVehicles(userDetails?.user?.vehicles)
    }
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        })
    }
  },[])

  useEffect(() => {
    setVehicles(userDetails?.user?.vehicles)
  },[userDetails])

  const handleEmptyAllFields = () => {
    setAvailableEnergy('');
    setBiddingAmount('');
    setRequiredEnergy('');
    setMaxPrice('');
  }

  const energyBool = (value) => {
    if(value<0){
      props.toggleSnackbar({open:'true',message:'Please Enter a Valid Energy',status:false});
      return false;
    }
    if(value>vehicleCap){
      props.toggleSnackbar({open:'true',message:`Vehicle Capacity is ${vehicleCap} kWh`,status:false});
      return false;
    }
    return true;
  }

  const priceBool = (value) => {
    if(value<0){
      props.toggleSnackbar({open:'true',message:'Please Enter a Valid Price',status:false});
      return false;
    }
    return true;
  }

  const handleVehicleChange = (value) => {
    setVehicle(value);
    setVehicleCap(vehicles.find((item)=>item?._id===value)?.batteryCapacity);
    setAvailableEnergy("");
    setRequiredEnergy("");
  }

  const handleSubmit = () => {
    if(!transactionStatus){
      setTransactionStatus(true);
      return
    }
    else if(vehicleSelected===""){
      props.toggleSnackbar({open:'true',message:'Please Select the Vehicle, if not present add one',status:false})
      return;
    }
    else if(transactionType === 'Buy' && (requiredEnergy==='' || maxPrice === '')){
      props.toggleSnackbar({open:'true',message:'Please Enter the Required Fields',status:false});
      return;
    }
    else if(transactionType === 'Sell' && (availableEnergy==='' || biddingAmount === '')){
      props.toggleSnackbar({open:'true',message:'Please Enter the Required Fields',status:false});
      return;
    }
    
    const payload = {
      userId:localStorage.getItem("userId"),
      typeOfPost:1,
      vehicleId:vehicleSelected,
      typeOfOrder:transactionType,
      energy:transactionType==="Buy"?requiredEnergy:availableEnergy,
      chargePerUnit:transactionType==="Buy"?maxPrice:biddingAmount,
      selectedContract:'Manual',
      location:{
        type:'Point',
        coordinates:[location?.latitude,location?.longitude]
      }
    }
    props.createPost({data:payload}).then((response)=>{
      if(response.payload.status===200 || response.payload.status===201){
        setTransactionType("")
        setTransactionStatus(false)
        handleEmptyAllFields();
      }
    })
  }

  return (
    <div>
        <TransactionNavbar/> 
        <div style={{display:'flex', flexDirection:'column',alignItems:'center',margin:'2rem',width:'-webkit-fill-available',height:'100%'}}>
            <h3 style={{fontWeight:'700'}}>New Request</h3>
            <div style={{width:'40%'}} className="form-group">
              <label htmlFor="transactionType" style={{fontWeight:'600',marginTop:'1rem'}}>Buy or Sell?</label>
              <select style={{width:'100%'}} value={transactionType} onChange={(e)=>{
                setTransactionType(e.target.value)
                setTransactionStatus(false)
                handleEmptyAllFields();
                setVehicle("")
                }} className="form-control">
                <option value="">None</option>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>
              {!transactionStatus && transactionType!=="" && <button style={{marginTop:'1rem', width:'100%', background:'teal'}} className="btn btn-primary" onClick={()=>setTransactionStatus(true)}>Submit</button>}
              {transactionType!=="" && transactionStatus &&
              <>
                <div>
                <label htmlFor="Car" style={{fontWeight:'600',marginTop:'1rem'}}>Select Car</label>
                <select style={{width:'100%'}} value={vehicleSelected} onChange={(e)=>handleVehicleChange(e.target.value)} className="form-control">
                  <option value="">None</option>
                  {utils.arrayLengthChecker(vehicles) && vehicles?.map((vehicle)=>(
                    <option key={vehicle?._id} value={vehicle?._id}>{vehicle?.vehicleDomain} {vehicle?.vehicleName} {vehicle?.vehicleModel} - {vehicle?.nickName}</option>
                  ))}
                </select>
              </div>
              </>}
              {transactionType === 'Buy'&& transactionStatus && vehicleSelected!=="" && <>
                <label htmlFor="rE" style={{fontWeight:'600', marginTop:'1rem', width:'100%'}}>Required Energy(in kWh)*:</label>
                <input
                    type="number"
                    id="rE"
                    className="form-control"
                    value={requiredEnergy}
                    onChange={(e) => energyBool(e.target.value)?setRequiredEnergy(e.target.value):{}}
                    required
                />
                <label htmlFor="mP" style={{fontWeight:'600', marginTop:'1em',width:'100%'}}>Max price per kWh*:</label>
                <input
                    type="number"
                    id="bA"
                    className="form-control"
                    value={maxPrice}
                    onChange={(e) => priceBool(e.target.value)?setMaxPrice(e.target.value):{}}
                    required
                />
              </>}
              {transactionType === 'Sell' && transactionStatus && vehicleSelected!=="" && <>
                <label htmlFor="aE" style={{fontWeight:'600', marginTop:'1rem', width:'100%'}}>Available Energy(in kWh)*:</label>
                <input
                    type="number"
                    id="aE"
                    className="form-control"
                    value={availableEnergy}
                    onChange={(e) => energyBool(e.target.value)?setAvailableEnergy(e.target.value):{}}
                    required
                />
                <label htmlFor="bA" style={{fontWeight:'600', marginTop:'1em',width:'100%'}}>Bidding Amount per kWh*:</label>
                <input
                    type="number"
                    id="bA"
                    className="form-control"
                    value={biddingAmount}
                    onChange={(e) => priceBool(e.target.value)?setBiddingAmount(e.target.value):{}}
                    required
                />
              </>}
              {transactionType!=='' && transactionStatus && <button style={{marginTop:'1rem', width:'100%', background:'teal'}} className="btn btn-primary" onClick={()=>handleSubmit()}>Submit</button>}
            </div>
        </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  snackBarStatus: state.snackBarStatus,
  userDetails:state.userDetails,
});

const mapDispatchToProps = {
  toggleSnackbar,
  getUserDetails,
  createPost
};

export default connect(mapStateToProps,mapDispatchToProps)(NewTransaction)