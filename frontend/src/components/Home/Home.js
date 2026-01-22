import React,{useEffect,useState} from 'react'
import {connect} from 'react-redux';
import Navbar from "../Shared/Navbar/Navbar";
import {getUserDetails} from '../../Redux/Actions';

const Home = (props) => {
  const {userDetails} = props;
  useEffect(()=>{
    props.getUserDetails({params:{userId:localStorage.getItem("userId")}})
  },[])
  return (
    <div>
      <Navbar />
      <div style={{margin:"30px", display:"flex", flexDirection:"column", gap:"20px", width:"200px"}}>
        <div>Welcome to Home</div>
        <label for="cars">Add a Vehicle:</label>
        <select style={{width:"100%"}} id="cars" name="cars">
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="fiat">Fiat</option>
          <option value="audi">Audi</option>
        </select>
        <button type="submit" className="btn btn-primary w-50">Submit</button>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    userDetails: state.userDetails,
})

const mapDispatchToProps =  {
  getUserDetails
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)