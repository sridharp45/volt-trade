import React, { useState } from 'react';
import {connect} from 'react-redux';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TextField, Typography } from '@mui/material';
import {postSignUpDetails, toggleSnackbar} from '../../Redux/Actions';

const SignUp = (props) => {
  const history = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile,setMobile] = useState('');
  const [organization,setOrganization] = useState('')
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorField,setError] = useState({field:'',message:''})
  const validations = [
    {title:'name',pattern:"^.*$",maxLength:80, pMsg:"Only alphanumeric are allowed"},
    {title:'email',pattern:"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",maxLength:0, pMsg:"Enter valid email"},
    {title:'mobile',pattern:"^[ 0-9 ]*$",maxLength:10,pMsg:"Only numbers are allowed"},
    {title:'organization',pattern:"^.*$",maxLength:15, pMsg:"Only alphabets are allowed"},
    {title:'password',pattern:"^.*$",minLength:8, maxLength:0,pMsg:""},
  ]

  const emptyError = () => {
    setError({field:'',message:''})
  }

  const handleError = (title,msg) => {
    setError({
        field:title,
        message:msg
    })
  }

  const handleCommonChange = (e,title) => {
    if(e.target.value===""){
      emptyError();
      return true;
    }
    let valid = validations.find((item)=>item.title===title);
    let pattern = valid.pattern?valid.pattern:"";
    if(pattern!=="" && !(new RegExp(pattern).test(e.target.value))){
      handleError(valid.title,valid.pMsg);
      return false;
    }else if(valid.maxLength!==0 && e.target.value?.length>valid.maxLength){
      handleError(valid.title,`${valid.title} length cannot be greater than ${valid.maxLength}`);
      return false;
    }else if(valid.minLength && e.target.value?.length<valid.minLength){
        handleError(valid.title,`${valid.title} length cannot be less than ${valid.minLength}`)
    }else{
      emptyError();
      return true;
    }
  }

  const handleConfPassword = (e) => {
    if(e.target.value && e.target.value?.length>password?.length){
        handleError('confPassword','Length is more than original password')
    }
    else if(e.target.value==="" || e.target.value!==password){
        if(e.target.value!=="")handleError('confPassword','Password did not match')
        setConfPassword(e.target.value);
    }else if(e.target.value && e.target.value===password){
        setConfPassword(e.target.value);
        emptyError();
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      if (errorField.field === '' && errorField.message === '') {
        const payload = {
          username: username,
          email: email,
          mobile: mobile,
          organization: organization,
          password: password
        }
        await props.postSignUpDetails({ data: payload })
          .then((response) => {
            if (response.payload.status === 200) {
              localStorage.setItem("email", email);
              localStorage.setItem("userId", response?.payload?.data?.userId);
              history('/', { replace: true });
            }
          })
          .catch((error) => {
            console.error(error);
          })
      } else {
        props.toggleSnackbar({
          open: true,
          message: "Please fill all the fields properly",
          status: false,
        });
      }
    }
    catch(error){
      console.error(error,"error");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="text-center">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Name</label>
              <TextField
                size='small'
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e)=>handleCommonChange(e,"name")? setUsername(e.target.value):{}}
                helperText={errorField.field==="name"?errorField.message:""}
                error={errorField.field==="name"}
                required
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="email">Email</label>
              <TextField
                size='small'
                type="text"
                id="email"
                className="form-control"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                helperText={errorField.field==="email"?errorField.message:""}
                error={errorField.field==="email"?true:false}
                onBlur={()=>handleCommonChange({target:{value:email}},"email")?{}:setEmail("")}
                required
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="mobile">Mobile</label>
              <TextField
                size='small'
                type="text"
                id="mobile"
                className="form-control"
                value={mobile}
                onChange={(e)=>handleCommonChange(e,"mobile") ? setMobile(e.target.value):{}}
                helperText={errorField.field==="mobile"?errorField.message:""}
                error={errorField.field==="mobile"}
                required
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="organization">Organization</label>
              <TextField
                size='small'
                type="text"
                id="organization"
                className="form-control"
                value={organization}
                onChange={(e)=>handleCommonChange(e,"organization")? setOrganization(e.target.value):{}}
                helperText={errorField.field==="organization"?errorField.message:""}
                error={errorField.field==="organization"}
                required
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="password">Password</label>
              <TextField
                size='small'
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                helperText={errorField.field==="password"?errorField.message:""}
                error={errorField.field==="password"}
                onBlur={()=>handleCommonChange({target:{value:password}},"password")?{}:setPassword("")}
                required
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="confPassword">Confirm Password</label>
              <TextField
                size='small'
                type="password"
                id="confPassword"
                className="form-control"
                value={confPassword}
                onChange={handleConfPassword}
                helperText={errorField.field==="confPassword"?errorField.message:""}
                error={errorField.field==="confPassword"}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">Sign Up</button>
          </form>
          <Typography className='mt-3'>Do you have an account already? <Link to="/login" className="menu-links" style={{color:'#0062AF'}}>Login</Link></Typography>
          {message && <div className="alert mt-3 text-center">{message}</div>}
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
  postSignUpDetails: (payload) => dispatch(postSignUpDetails(payload)),
});

export default connect(mapStateToProps,mapDispatchToProps)(SignUp);
