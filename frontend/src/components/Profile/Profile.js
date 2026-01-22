import React,{useState, useRef, useEffect} from 'react'
import {connect} from 'react-redux';
import {getUserDetails,putSignUpDetails,toggleSnackbar} from '../../Redux/Actions';
import { Button, Paper, TextField, Typography } from '@mui/material';
import userProfile from '../assets/Images/userProfile.jpg';
import * as utils from '../../utils/utils';
import AvatarCircle from '../Reusables/Avatar';
import Navbar from '../Shared/Navbar/Navbar';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";

const Profile = (props) => {
    const {userDetails} = props;
    const history = useNavigate()
    const [name,setName] = useState(userDetails?.user?.username?userDetails?.user?.username:'');
    const [email,setEmail] = useState(userDetails?.user?.email?userDetails?.user?.email:'');
    const [mobile,setMobile] = useState(userDetails?.user?.phone?userDetails?.user?.phone:'');
    const [organization,setOrganization] = useState(userDetails?.user?.organization?userDetails?.user?.organization:'');
    const [logoBase64, setLogoBase64] = useState(userDetails?.user?.icon ? userDetails?.user?.icon: ""); 
    const hiddenFileInput = useRef(null);
    // const [pasSetUp,setPasSetUp] = useState(false);
    // const [prevPassword, setPrevPassword] = useState('');
    // const [password, setPassword] = useState('');
    // const [confPassword, setConfPassword] = useState('');
    const [edit,setEdit] = useState(false);
    const [errorField,setError] = useState({field:'',message:''})

    const validations = [
        {title:'name',pattern:"^.*$",maxLength:80, pMsg:"Only alphanumeric are allowed"},
        {title:'email',pattern:"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",maxLength:0, pMsg:"Enter valid email"},
        {title:'mobile',pattern:"^[ 0-9 ]*$",maxLength:10,pMsg:"Only numbers are allowed"},
        {title:'organization',pattern:"^.*$",maxLength:15, pMsg:"Only alphabets are allowed"},
        {title:'password',pattern:"^.*$",minLength:8, maxLength:0,pMsg:""},
    ]
    useEffect(()=>{
        if(!userDetails.user)props.getUserDetails({params:{userId:localStorage.getItem("userId")}})
    },[])

    useEffect(() => {
        if(userDetails?.user?.username){
            setName(userDetails?.user?.username)
        }
        if(userDetails?.user?.email){
            setEmail(userDetails?.user?.email)
        }
        if(userDetails?.user?.phone){
            setMobile(userDetails?.user?.phone)
        }
        if(userDetails?.user?.organization){
            setOrganization(userDetails?.user?.organization)
        }
        if(userDetails?.user?.icon){
            setLogoBase64(userDetails?.user?.icon)
        }
    },[userDetails])

    const emptyError = () => {
        setError({field:'',message:''})
    }

    const handleError = (title, msg) => {
        setError({
            field: title,
            message: msg
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

    const handleClick = () => {
        if(edit)hiddenFileInput.current.click();
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const maxSize = 60 * 1024; // 60kb
        const allowedTypes = ['image/jpeg', 'image/png']
        if (file.size > maxSize) {
          props.toggleSnackbar({ open: true, message: "File size should be less than 60kb", status: false });
          return;
        }
        if (!allowedTypes.includes(file.type)) {
            setLogoBase64("");
            props.toggleSnackbar({ open: true, message: "'Please select a valid file type (JPG, PNG).'", status: false });
        }
        utils.handleFileChange(event, setLogoBase64);
      }
    };

    const handleLogout = () => {
        history("/", { replace: true });
        localStorage.clear();
    }

    const handleSubmit = async (e) => {
        if (!edit) {
            setEdit(true);
            return;
        }
        e.preventDefault();
        try {
            if (name === "" || email === "") {
                props.toggleSnackbar({
                    open: true,
                    message: "Name or Email cannot be empty",
                    status: false,
                });
                return;
            }
            // if(pasSetUp && (prevPassword==="" || password==="" || confPassword==="")){
            //     props.toggleSnackbar({
            //         open: true,
            //         message: "Enter all password fields if password change is needed",
            //         status: false,
            //     });
            //     return;
            // }
            // if(pasSetUp && password!==confPassword){
            //     props.toggleSnackbar({
            //         open: true,
            //         message: "Passwords do not match",
            //         status: false,
            //     });
            //     return;
            // }
            const payload = {
                userId: userDetails?.user?.userId,
                username: name,
                email: email,
                phone: mobile,
                organization: organization,
                icon: logoBase64,
            }
            //   if(pasSetUp)payload.pasSetUp = pasSetUp;
            //   if(pasSetUp)payload.prevPassword = prevPassword;
            //   if(pasSetUp)payload.password = password;
            await props.putSignUpDetails({ data: payload })
                .then((response) => {
                    if (response.payload.status === 200) {
                        localStorage.setItem("email", email);
                        localStorage.setItem("userId", response?.payload?.data?.user?.userId);
                        setEdit(false);
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
        }
        catch (error) {
            console.error(error, "error");
        }
    };
  return (
    <div >
        <Navbar />
        <div style={{display:'flex',flexWrap:'wrap',flexDirection:'column',alignContent:'center',margin:'2rem'}}>
            <div style={{display:'flex',justifyContent:'center',fontWeight:'700', fontSize:'24px'}}>Edit Profile</div>
            <Paper style={{display:"flex",flexWrap:'wrap',flexDirection:'column',alignItems:'center', alignContent:'strech',marginTop:'2rem', width:'30%',padding:'1rem',gap:'1rem'}}>
                <AvatarCircle userIcon={logoBase64?logoBase64:userProfile} click={()=>handleClick()} reference={hiddenFileInput} changeInput={handleFileUpload}/>
                <TextField
                    id="outlined-basic"
                    label="Name"
                    variant="outlined"
                    size="small"
                    value={name}
                    style={{width:'100%'}}
                    onChange={(e)=>handleCommonChange(e,"name")? setName(e.target.value):{}}
                    helperText={errorField.field==="name"?errorField.message:""}
                    error={errorField.field==="name"}
                    disabled={!edit}
                    required
                />
                <TextField
                    id="outlined-basic"
                    label="Email"
                    variant="outlined"
                    size="small"
                    value={email}
                    style={{width:'100%'}}
                    onChange={(e)=>setEmail(e.target.value)}
                    helperText={errorField.field==="email"?errorField.message:""}
                    error={errorField.field==="email"?true:false}
                    onBlur={()=>handleCommonChange({target:{value:email}},"email")?{}:setEmail("")}
                    disabled={!edit}
                    required
                />
                <TextField
                    id="outlined-basic"
                    label="Mobile"
                    variant="outlined"
                    size="small"
                    value={mobile}
                    style={{width:'100%'}}
                    onChange={(e)=>handleCommonChange(e,"mobile") ? setMobile(e.target.value):{}}
                    helperText={errorField.field==="mobile"?errorField.message:""}
                    error={errorField.field==="mobile"}
                    disabled={!edit}
                />
                <TextField
                    id="outlined-basic"
                    label="Organization"
                    variant="outlined"
                    size="small"
                    value={organization}
                    style={{width:'100%'}}
                    onChange={(e)=>handleCommonChange(e,"organization")? setOrganization(e.target.value):{}}
                    helperText={errorField.field==="organization"?errorField.message:""}
                    error={errorField.field==="organization"}
                    disabled={!edit}
                />
                {/* {edit && <div style={{display:'flex',justifyContent:'flex-start', width:'100%',alignItems:'center'}}>
                    <Checkbox checked={pasSetUp} style={{color:'#0062AF'}} onClick={()=>setPasSetUp(!pasSetUp)} />
                    <Typography style={{marginLeft:'0.5rem'}}>Change Password</Typography>
                </div>}
                {pasSetUp && edit && <TextField
                    id="outlined-basic"
                    label="Previous Password"
                    variant="outlined"
                    size="small"
                    value={prevPassword}
                    style={{width:'100%'}}
                    onChange={(e)=>setPrevPassword(e.target.value)}
                    required
                />}
                {pasSetUp && edit && <TextField
                    id="outlined-basic"
                    label="New Password"
                    variant="outlined"
                    size="small"
                    value={password}
                    style={{width:'100%'}}
                    onChange={(e)=>setPassword(e.target.value)}
                    helperText={errorField.field==="password"?errorField.message:""}
                    error={errorField.field==="password"}
                    onBlur={()=>handleCommonChange({target:{value:password}},"password")?{}:setPassword("")}
                    required
                />}
                {pasSetUp && edit && <TextField
                    id="outlined-basic"
                    label="Confirm New Password"
                    variant="outlined"
                    size="small"
                    value={confPassword}
                    style={{width:'100%'}}
                    onChange={(e)=>setConfPassword(e.target.value)}
                    helperText={errorField.field==="confPassword"?errorField.message:""}
                    error={errorField.field==="confPassword"}
                    required
                />} */}
                <div style={{display:'flex',width:'100%',justifyContent:'space-between'}}>
                <Button style={{flexGrow:1}} onClick={handleSubmit}>{edit?"Save":"Edit"}</Button>
                {!edit && <Button style={{flexGrow:1}} onClick={handleLogout}>LOGOUT
                <LogoutIcon style={{marginLeft:'0.5rem'}}/>
                </Button>}
                </div>
            </Paper>
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
  toggleSnackbar,
  getUserDetails,
  putSignUpDetails,

}

export default connect(mapStateToProps,mapDispatchToProps)(Profile)