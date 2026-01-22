import React, { useEffect, useState } from "react";
import {connect} from 'react-redux'; 
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./components/Home/Home";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import UserTxn from "./components/userTxn/userTxn";
import * as utils from './utils/utils';

import PendingTransactions from "./components/Transactions/PendingTransactions";
import PastTransactions from "./components/Transactions/PastTransactions";
import NewTransaction from "./components/Transactions/NewTransaction";
import SignUp from "./components/Login/SignUp";
import Vehicle from "./components/Vehicle Dashboard/Vehicle";
import SnackbarComp from "./components/Reusables/CustomSnackbar";
import Profile from "./components/Profile/Profile";
import VehicleInventory from "./components/Vehicle Dashboard/VehicleInventory";
import AddVehicle from "./components/Vehicle Dashboard/AddVehicle";
import Posts from "./components/Transactions/Posts";
import Wallet from "./components/Wallet/Wallet";
import HomeGrid from "./components/HomeMangement/HomeGrid";
import HomeGridPending from "./components/HomeMangement/HomeGridPending";
import HomeGridHistory from "./components/HomeMangement/HomeGridHistory";
import LiveStream from "./livestream";
import AdminPage from "./components/Admin/Admin";
import HelpnSupport from './components/HelpnSupport/HelpnSupport';
import {
  Widget,
  addResponseMessage,
  setQuickButtons,
  // toggleWidget,
  // addLinkSnippet,
  // addUserMessage,
} from "react-chat-widget";
import "react-chat-widget/lib/styles.css";
import Charging from "./components/Charging/Charging";
import "./App.css";
import { createHelp, toggleSnackbar, getUserDetails } from './Redux/Actions';

const prompts = [
  { name: "Home", link: "/home" },
  { name: "Transaction request", link: "/transactions" },
  { name: "Vehicle Dashboard", link: "/vehicleDashboard" },
  { name: "Vehicle Inventory", link: "/vehicleDashboard/inventory" },
  { name: "Profile", link: "/profile" },
  { name: "Wallet", link: "/home" },
  { name: "Add a vehicle", link: "/vehicleDashboard/add" },
  { name: "Posts", link: "/transactions/post" },
  { name: "Pending Transactions", link: "/transactions/pending" },
  { name: "Transactions History", link: "/transactions/past" },
  { name: "Past Transactions", link: "/transactions/past" },
  { name: "Home Management", link: "/homeGrid" },
  { name: "Pending Home Transactions", link: "/homeGrid/pending" },
  { name: "Home Transactions History", link: "/homeGrid/past" },
];


function App(props) {
  const navigate = useNavigate();
  const [isRaisingTicket, setIsRaisingTicket] = useState(false);
  const [ticketDescription, setTicketDescription] = useState("");
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false); // Track if confirmation is needed

  // Uncomment this if you want to redirect to login page if user is not logged in
  // useEffect(()=>{
  //   if(utils.getCookie('auth_token')===""){
  //     navigate('/login',{replace:true});
  //     localStorage.clear();
  //   }
  // },[localStorage,utils.getCookie('auth_token')])

  useEffect(() => {
    // Set initial chatbot response
    addResponseMessage("Hi! How can I assist you?");
    addResponseMessage("Hi! To raise a ticket, type **raise ticket**. I will guide you through the process.");
    // Set quick action buttons for all prompts
    setQuickButtons(
      prompts.map((prompt) => ({
        label: prompt.name,
        value: prompt.name,
      }))
    );
  }, []);

  const handleNewUserMessage = (newMessage) => {
    if (isRaisingTicket) {
      setTicketDescription(newMessage);
      addResponseMessage("Description received. Do you want to submit the ticket? (Type 'submit' to confirm)");
      setIsConfirmingSubmit(true); // Ask for submission confirmation
      setIsRaisingTicket(false);
      return;
    }

    // Check for "Raise Ticket" command
    if (newMessage.toLowerCase() === "raise ticket") {
      setIsRaisingTicket(true);
      addResponseMessage("Please provide a brief description of the issue.");
      return;
    }

    // Handle the submission confirmation
    if (isConfirmingSubmit) {
      if (newMessage.toLowerCase() === "submit") {
        handleSubmitTicket();
        setIsConfirmingSubmit(false); // Reset confirmation state
      } else {
        addResponseMessage("Ticket not submitted. If you'd like to submit, type 'submit'.");
        setIsConfirmingSubmit(false); // Reset confirmation state
      }
      return;
    }

    // Find the selected prompt
    const selectedPrompt = prompts.find(
      (prompt) => prompt.name.toLowerCase() === newMessage.toLowerCase()
    );

    if (selectedPrompt) {
      navigate(selectedPrompt.link);
      addResponseMessage(`Navigating to ${selectedPrompt.name}...`);
    } else {
      addResponseMessage("Sorry, I didn't understand that. Please select an option above.");
    }
  };

  const handleQuickButtonClicked = (value) => {
    handleNewUserMessage(value);
  };

  const handleSubmitTicket = () => {
    if (!ticketDescription) {
      addResponseMessage("Description cannot be empty. Please provide a valid description.");
      return;
    }
    const payload = {
      query:ticketDescription,
      userId:localStorage.getItem("userId"),
    }
    props.createHelp({data:payload}).then((response)=>{
      if(response.payload.status===200){
        addResponseMessage("Ticket raised successfully! We'll get back to you soon.");
        setTicketDescription("");
      }else{
        addResponseMessage("Failed to raise the ticket. Please try again.");
      }
    })
    // Example API call
    // fetch("/api/raise-ticket", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ description: ticketDescription }),
    // })
    //   .then((response) => {
    //     if (response.ok) {
    //       addResponseMessage("Ticket raised successfully! We'll get back to you soon.");
    //       setTicketDescription(""); // Clear description after submission
    //     } else {
    //       addResponseMessage("Failed to raise the ticket. Please try again.");
    //     }
    //   })
    //   .catch(() => {
    //     addResponseMessage("An error occurred while raising the ticket. Please try again.");
    //   });
  };

  return (
    <>
      <Routes>
        <Route path="/" exact element={<Login />} />
        <Route path="/login" exact element={<Login />} />
        <Route path="/admin" exact element={<AdminPage />} />
        <Route path="/signup" exact element={<SignUp />} />
        <Route path="/home" exact element={<Wallet />} />
        <Route path="/liveStream" exact element={<LiveStream />} />
        <Route path="/support" exact element={<HelpnSupport />} />
        {/* <Route path="/wallet" exact element={<Wallet/>} /> */}
        <Route path="/profile" exact element={<Profile />} />
        <Route path="/vehicleDashboard" exact element={<Vehicle />} />
        <Route path="/vehicleDashboard/add" exact element={<AddVehicle />} />
        <Route path="/vehicleDashboard/inventory" exact element={<VehicleInventory />} />
        <Route path="/dashboard" exact element={<Dashboard />} />
        <Route path="/transactions" exact element={<NewTransaction />} />
        <Route path="/transactions/pending" exact element={<PendingTransactions />} />
        <Route path="/transactions/post" exact element={<Posts />} />
        <Route path="/transactions/past" exact element={<PastTransactions />} />
        <Route path="/homeGrid" exact element={<HomeGrid />} />
        <Route path="/homeGrid/pending" exact element={<HomeGridPending />} />
        <Route path="/homeGrid/past" exact element={<HomeGridHistory />} />
        <Route path="/charging" exact element={<Charging />} />
      </Routes>
      <SnackbarComp />

      {/* Chatbot Widget */}
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title="Virtual Assistant"
        subtitle="Click or type an option to navigate"
        handleQuickButtonClicked={handleQuickButtonClicked}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  snackBarStatus: state.snackBarStatus,
  userDetails:state.userDetails,
});

const mapDispatchToProps = {
  toggleSnackbar,
  getUserDetails,
  createHelp
};

export default connect(mapStateToProps,mapDispatchToProps)(App)
