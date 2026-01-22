import React, { useEffect, useState } from 'react';
import {connect} from 'react-redux';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import {postLoginDetails, toggleSnackbar} from '../../Redux/Actions';
import SnackbarComp from '../Reusables/CustomSnackbar';

function Login(props) {
  const history = useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(()=>{
    if(localStorage.getItem("email")!==null && localStorage.getItem("userId")!==null){
      history("/home", { replace: true });
    }
  },[])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(email && password){
        const payload = {
          email:email,
          password:password
        }
        await props.postLoginDetails({data:payload})
        .then((response)=>{
          if(response.payload.status===200){
            localStorage.setItem("email", email);
            localStorage.setItem("userId", response?.payload?.data?.userId);
            history("/home", { replace: true });
          }
        })
        .catch((error)=>{ 
          props.toggleSnackbar({
            open: true,
            message: error.response ? error.response.data.message : 'Server error',
            status: false,
          });
        })
        ;
      }else{
        props.toggleSnackbar({
          open: true,
          message: "Please fill email and password",
          status: false,
        });
      }
      // const response = await axios.post('http://localhost:8000/login', { email, password });
      // setMessage(response.data.message);
    } catch (error) {
      props.toggleSnackbar({
        open: true,
        message: error.response ? error.response.data.message : 'Server error',
        status: false,
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">Login</button>
          </form>
          <Typography className='justify-content-center mt-3'>Don't have an account? <Link to="/signup" className="menu-links" style={{color:'#0062AF'}}>SignUp</Link></Typography>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  snackBarStatus: state.snackBarStatus,
});

const mapDispatchToProps = (dispatch) => ({
  toggleSnackbar: (payload) => dispatch(toggleSnackbar(payload)),
  postLoginDetails: (payload) => dispatch(postLoginDetails(payload)),
});

export default connect(mapStateToProps,mapDispatchToProps)(Login);
