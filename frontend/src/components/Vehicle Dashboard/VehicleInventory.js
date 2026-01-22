import React, { useEffect, useState } from 'react'
import {connect} from 'react-redux';
import VehicleNavbar from './VehicleNavbar'
import {toggleSnackbar,postDeleteVehicle,getUserDetails,setVehicle} from '../../Redux/Actions';
import * as utils from '../../utils/utils';
import { Button, Divider, Paper } from '@mui/material';
import { Link } from 'react-router';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useNavigate } from "react-router-dom";

const VehicleInventory = (props) => {
  const {userDetails} = props;
  const history = useNavigate();
  const [userVehicles,setUserVehicles] = useState([]);
  useEffect(() => {
    props.getUserDetails({params:{userId:localStorage.getItem("userId")}});
  },[])
  useEffect(() => { 
    const user = userDetails?.user?.vehicles? userDetails?.user?.vehicles:[];
    setUserVehicles(user);
  },[userDetails])

  const handleVehicle = (vehicle) => {
    props.setVehicle(vehicle);
    history("/vehicleDashboard");
  }

  const handleDeleteVehicle = (vehicle) => {
    const payload = {
      userId:vehicle?.user,
      vehicleId:vehicle?._id
    }
    props.postDeleteVehicle({data:payload}).then((response)=>{
      if(response.payload.status===200){
        props.getUserDetails({params:{userId:localStorage.getItem("userId")}});
      }
    })
  }
  return (
    <div>
        <VehicleNavbar/>
        <div style={{margin:"30px", display:"flex",flexWrap:'wrap', width:"-webkit-fill-available"}}>
          {utils.arrayLengthChecker(userVehicles) ? userVehicles?.map((vehicle)=>(
              <Paper sx={{margin:"1rem", boxShadow:"2px 2px 4px black", borderRadius:"10px", width:'30%', 
            " .DeleteContainer": {
              opacity: 0,
            },
            "&:hover .Delete-Container": {
              opacity: 1,
            },
            }}>
              <div
                onClick={()=>handleVehicle(vehicle)}
                style={{ textDecoration: "none", color: "inherit", cursor:'pointer' }}
                key={vehicle._id}
              >
              <div style={{margin:"20px"}}>
                  Car NickName: {vehicle?.nickName}
                  <br/>
                  Car Domain: {vehicle?.vehicleDomain}
                  <br/>
                  Car Name: {vehicle?.vehicleName}
                  <br/>
                  Car Model: {vehicle?.vehicleModel}  
                  <br/>
                  Battery Capacity: {vehicle?.batteryCapacity}
                  <br/> 
                  <div className='Delete-Container' style={{display:'flex'}}>
                    <Button style={{padding:0, marginTop:'1rem'}} onClick={()=>handleDeleteVehicle(vehicle)}>
                      <DeleteOutlineOutlinedIcon/>
                      Delete Vehicle
                    </Button>
                  </div>
              </div>
              </div>
            </Paper>
          ))
          :
          <Paper style={{margin:"1rem", padding:"20px", boxShadow:"2px 2px 4px black", borderRadius:"10px", width:'30%',display:'flex',flexDirection:'column',alignItems:'center', gap:'20px'}}>
              <div>No Inventory found</div>
              <Link to="/vehicleDashboard/add" style={{color:'black', textDecoration:'none'}}>
              <Button >
                <AddCircleOutlineOutlinedIcon/>
                Add Vehicle
              </Button>
              </Link>
          </Paper>
        }
        </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  isLoading: state.isLoading,
  userDetails: state.userDetails,
})

const mapDispatchToProps =  {
  postDeleteVehicle,
  toggleSnackbar,
  getUserDetails,
  setVehicle
}

export default connect(mapStateToProps, mapDispatchToProps)(VehicleInventory)