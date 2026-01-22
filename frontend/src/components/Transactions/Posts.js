import React, { useEffect, useState } from 'react'
import {connect} from 'react-redux';
import TransactionNavbar from './TransactionNavbar'
import {toggleSnackbar,getUserDetails, getAllTrades, acceptTrade, deleteTrade} from '../../Redux/Actions';
import * as utils from '../../utils/utils';
import { Button, Divider, Icon, IconButton, Paper } from '@mui/material';
import { Link } from 'react-router';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'; 
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined'; 
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';

const Posts = (props) => {
    const [userPosts, setUserPosts] = useState([]);
    const [requests, setRequests] = useState([]);
    const [YourPosts, setYourPosts] = useState(true);
    const [PeerPosts, setPeerPosts] = useState(true);
    const [vehicles,setVehicles] = useState([]);
    const [vehicleSelected,setVehicle] = useState("");
    const [acceptStatus,setAcceptStatus] = useState("")
    const {allTrades, userDetails} = props

    useEffect(()=>{
        if(!userDetails.user)props.getUserDetails({params:{userId:localStorage.getItem("userId")}})
        props.getAllTrades()
    },[])
    useEffect(()=>{
        if(allTrades && utils.arrayChecker(allTrades)){
            let userP=allTrades?.filter((trade)=>trade?.userId===localStorage.getItem("userId"))
            setUserPosts(userP);
            let peerP=allTrades?.filter((trade)=>trade?.userId!==localStorage.getItem("userId"))
            setRequests(peerP);
        }
    },[allTrades])

    useEffect(() => {
        setVehicles(userDetails?.user?.vehicles)
    },[userDetails])

    const handleDelete = (trade) => {
        props.deleteTrade({params:{tradeId:trade?._id}}).then((response)=>{
            if(response.payload.status===200){
                props.getAllTrades();
            }
        })
    }

    const handleAccept = (request) => {
        if(request._id!==acceptStatus){
            setAcceptStatus(request._id);
            setVehicle("");
            props.toggleSnackbar({open:true,message:'Select the vehicle',status:true})
            return
        }
        if(vehicleSelected===""){
            props.toggleSnackbar({open:true,message:'Please select a vehicle',status:false})
            return
        }
        const payload = {
            acceptedUserId:localStorage.getItem("userId"),
            acceptantVehicleId:vehicleSelected,
        }
        props.acceptTrade({params:{tradeId:request._id},data:payload}).then((response)=>{
            if(response.payload.status===200){
                props.getAllTrades();
            }
            setAcceptStatus("");
            setVehicle("");
        })
    }

  return (
    <div>
        <TransactionNavbar/>
        <div style={{marginTop:'2rem', display:'flex', justifyContent:'center', fontSize:'24px', fontWeight:'600'}}>Your Posts
            <IconButton style={{marginLeft:'1rem'}} onClick={()=>setYourPosts(!YourPosts)}>{YourPosts?<KeyboardArrowUpOutlinedIcon/>:<KeyboardArrowDownOutlinedIcon/>}</IconButton>
        </div>
        {YourPosts && <div style={{margin:"30px", display:"flex",flexWrap:'wrap', width:"-webkit-fill-available"}}>
          {utils.arrayLengthChecker(userPosts) ? userPosts?.map((post)=>(
            <Paper sx={{margin:"1rem", padding:"20px", boxShadow:"2px 2px 4px black", borderRadius:"10px", width:'30%', 
            " .DeleteContainer": {
              opacity: 0,
            },
            "&:hover .Delete-Container": {
              opacity: 1,
            },
            }}>
              Type of Order: {post?.typeOfOrder}
              <br/>
              Transaction Energy: {post?.energy}
              <br/>
              Charge per Unit: {post?.chargePerUnit?.toFixed(2)}
              <br/>
              Car Model: {`${post?.vehicleId?.vehicleDomain} ${post?.vehicleId?.vehicleName} ${post?.vehicleId?.vehicleModel} - ${post?.vehicleId?.nickName}`}
              <br/>
              Status: {post?.state}
              {post?.state==="posted" && <div className='Delete-Container' style={{display:'flex'}}>
                <Button style={{padding:0, marginTop:'1rem'}} onClick={()=>handleDelete(post)}>
                  <DeleteOutlineOutlinedIcon/>
                  Cancel Trade
                </Button>
              </div>}
            </Paper>
          ))
          :
          <Paper style={{margin:"1rem", padding:"20px", boxShadow:"2px 2px 4px black", borderRadius:"10px", width:'30%',display:'flex',flexDirection:'column',alignItems:'center', gap:'20px'}}>
              <div>No Posts Yet</div>
              <Link to="/transactions" style={{color:'black', textDecoration:'none'}}>
              <Button >
                <AddCircleOutlineOutlinedIcon/>
                New Post
              </Button>
              </Link>
          </Paper>
          }
        </div>}
        <div style={{marginTop:'2rem', display:'flex', justifyContent:'center', fontSize:'24px', fontWeight:'600'}}>Requests from peers
        <IconButton style={{marginLeft:'1rem'}} onClick={()=>setPeerPosts(!PeerPosts)}>{PeerPosts?<KeyboardArrowUpOutlinedIcon/>:<KeyboardArrowDownOutlinedIcon/>}</IconButton>
        </div>
        {PeerPosts && <div style={{margin:"30px", display:"flex",flexWrap:'wrap', width:"-webkit-fill-available"}}>
          {utils.arrayLengthChecker(requests) ? requests?.map((request)=>(
            <Paper style={{margin:"1rem", padding:"20px", boxShadow:"2px 2px 4px black", borderRadius:"10px", width:'30%', 
            " .DeleteContainer": {
              opacity: 0,
            },
            "&:hover .Delete-Container": {
              opacity: 1,
            },
            }}>
              Type of Order: {request?.typeOfOrder}
              <br/>
              Transaction Energy: {request?.energy}
              <br/>
              Charge per Unit: {request?.chargePerUnit?.toFixed(2)}
              <br/>
              Car Model: {`${request?.vehicleId?.vehicleDomain} ${request?.vehicleId?.vehicleName} ${request?.vehicleId?.vehicleModel} - ${request?.vehicleId?.nickName}`}
              <br/>
              Status: {request?.state}
              <br/>
              {
                acceptStatus===request._id && 
                <div>
                <label htmlFor="Car" style={{fontWeight:'600',marginTop:'1rem'}}>Select Car</label>
                <select style={{width:'100%'}} value={vehicleSelected} onChange={(e)=>setVehicle(e.target.value)} className="form-control">
                  <option value="">None</option>
                  {utils.arrayLengthChecker(vehicles) && vehicles?.map((vehicle)=>(
                    <option key={vehicle?._id} value={vehicle?._id}>{vehicle?.vehicleDomain} {vehicle?.vehicleName} {vehicle?.vehicleModel} - {vehicle?.nickName}</option>
                  ))}
                </select>
                </div>
              }
              <div className='Delete-Container' style={{display:'flex'}}>
                <Button style={{padding:0, marginTop:'1rem'}} onClick={()=>handleAccept(request)}>
                  <AddTaskOutlinedIcon style={{marginRight:'0.5rem'}}/>
                  Accept Trade
                </Button>
              </div>
            </Paper>
          ))
          :
          <Paper style={{margin:"1rem", padding:"20px", boxShadow:"2px 2px 4px black", borderRadius:"10px", width:'30%',display:'flex',flexDirection:'column',alignItems:'center', gap:'20px'}}>
              <div>No Peer Posts</div>
          </Paper>
          }
        </div>}
    </div>
  )
}


const mapStateToProps = (state) => ({
    isLoading: state.isLoading,
    userDetails: state.userDetails,
    allTrades:state.allTrades,
  })
  
  const mapDispatchToProps =  {
    toggleSnackbar,
    getUserDetails,
    getAllTrades,
    acceptTrade,
    deleteTrade
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Posts)