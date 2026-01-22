import React,{useEffect,useState} from 'react'
import {connect} from 'react-redux';
import { Link } from "react-router-dom";
import Navbar from "../Shared/Navbar/Navbar";
import {getUserDetails, carList, postAddVehicle,toggleSnackbar} from '../../Redux/Actions';
import * as utils from '../../utils/utils'
import { Paper, TextField, Typography } from '@mui/material';
import Sidebar from '../Shared/Sidebar/Sidebar';
import VehicleNavbar from './VehicleNavbar';

const AddVehicle = (props) => {
  const {userDetails,carDetails} = props;
  const [car,setCar] = useState('');
  const [seal,setSeal] = useState('')
  const [modelYear,setModelYear] = useState('')
  const [charge,setChargeCap] = useState('')
  const [nickName, setNickName] = useState('')
  const [carCollection,setCarCollection] = useState({});
  useEffect(()=>{
    props.carList();
  },[])
  useEffect(()=>{
    setCarCollection(carDetails?.car_companies?carDetails?.car_companies:{});
  },[carDetails])

  const handleChangeCar = (e) => {
    setCar(e.target.value);
    setSeal("");
    setModelYear("");
    setChargeCap("");
  }
  const handleChangeSeal = (e) => {
    setSeal(e.target.value);
    setModelYear("");
    setChargeCap("");
  }
  const handleChangeModelYear = (e) => {
    setModelYear(e.target.value);
    let arr = carCollection[car]["cars"][seal];
    let model = arr.find((item)=>item["model_year"].toString() === e.target.value);
    if(model)setChargeCap(model["capacity"]);
    else setChargeCap("");
  }

  const handleSubmit = () => {
    if(nickName===""){
      props.toggleSnackbar({open:true, message:'Nick Name should not be empty', status:false})
      return;
    }
    if(car==="" || seal==="" || modelYear===""){
      props.toggleSnackbar({open:true, message:'Please select Car, Seal and Model Combination',status:false})
      return;
    }
    const payload = {
      userId:localStorage.getItem("userId"),
      vehicleDomain:car,
      vehicleName:seal,
      vehicleModel:modelYear,
      batteryCapacity:charge,
      nickName:nickName,
    }
    props.postAddVehicle({data:payload}).then((response)=>{
      if(response.payload.status===200){
        setNickName("");
        setCar("");
        setSeal("");
        setModelYear("");
        setChargeCap("");
      }
    })
  }

  return (
    <div>
      <VehicleNavbar/>
      <div style={{margin:"30px", display:"flex", flexDirection:"column", width:"-webkit-fill-available", alignItems:"center"}}>
        <div style={{display:'flex',justifyContent:'center',fontSize:'24px', fontWeight:"700"}}>Add your car details</div>
        <Paper style={{ width: "60%", margin: "1rem 0rem", padding: "1rem", boxShadow:'2px 2px 4px black', borderRadius:'10px'}}>
          <div style={{display:'flex', alignItems:'center',margin:'1em 0'}}>
            <Typography style={{width:'auto', marginRight:'0.5rem'}}><b>NickName:</b></Typography>
            <TextField size='small' type="text" id="cars" className="form-control" value={nickName} onChange={(e)=>setNickName(e.target.value)} required/>
          </div>
          <label for="cars"><b>Select a Car Domain:</b></label>
          <select style={{ width: "100%", height:'2rem'}} value={car} onChange={handleChangeCar} id="cars" name="cars">
            <option value="">None</option>
            {carCollection && utils.arrayLengthChecker(Object.keys(carCollection)) && Object.keys(carCollection)?.map((carItem) => (
              <option value={carItem}>{carItem}</option>
            ))}
          </select>
          {car && car!=="" && 
            <Paper style={{ width: "80%", marginTop: "1rem", padding: "1rem", boxShadow:'2px 2px 4px black',borderRadius:'10px'}}>
              <label for="carSeal"><b>Select a Car Name:</b></label>
              <select style={{ width: "100%", height: '2rem' }} value={seal} onChange={handleChangeSeal} id="carSeal" name="carSeal">
                <option value="">None</option>
                {carCollection && carCollection[car]?.cars && utils.arrayLengthChecker(Object.keys(carCollection[car]?.cars)) && Object.keys(carCollection[car]?.cars)?.map((sealItem) => (
                  <option value={sealItem}>{sealItem}</option>
                ))}
              </select>
              {seal && seal!=="" &&
                <Paper style={{ width: "80%", marginTop: "1rem", padding: "1rem", boxShadow:'2px 2px 4px black', borderRadius:'10px'}}>
                  <label for="model"><b>Select a Car Model Year:</b></label>
                  <select style={{ width: "100%", height: '2rem' }} value={modelYear} onChange={handleChangeModelYear} id="model" name="model">
                    <option value="">None</option>
                    {carCollection && carCollection[car]?.cars && carCollection[car]["cars"][seal] && utils.arrayLengthChecker(carCollection[car]["cars"][seal]) && carCollection[car]["cars"][seal]?.map((model) => (
                      <option value={model["model_year"]}>{model["model_year"]}</option>
                    ))}
                  </select>
                  {modelYear && modelYear!=="" && 
                    <div style={{display:'flex',justifyContent:'flex-start', width:'100%',alignItems:'center', marginTop:'1rem'}}>
                      <b>Capacity</b>: {charge} kWh
                    </div>
                  }
                </Paper>
              }
            </Paper>
          }
        </Paper>
        <button type="submit" className="btn btn-primary w-50" onClick={()=>handleSubmit()}>Submit</button>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    userDetails: state.userDetails,
    carDetails: state.carDetails,
})

const mapDispatchToProps =  {
  getUserDetails,
  carList,
  postAddVehicle,
  toggleSnackbar
}

export default connect(mapStateToProps, mapDispatchToProps)(AddVehicle)
