import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Navbar from "../Shared/Navbar/Navbar";
import { toggleSnackbar, getUserDetails, createHelp } from "../../Redux/Actions";
import { Button, TextField, Typography, InputAdornment, Grid, Card, CardContent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const HelpnSupport = (props) => {
  const [query, setQuery] = useState("");
  const { userDetails } = props;

  useEffect(() => {
    if (!userDetails?.user) {
      props.getUserDetails({ params: { userId: localStorage.getItem("userId") } });
    }
  }, [userDetails, props]);

  const handleSubmit = () => {
    if (query.trim() === "") {
      props.toggleSnackbar({ open: true, message: "Please enter a query", status: false });
      return;
    }

    const payload = {
      query,
      userId: localStorage.getItem("userId"),
    };

    props.createHelp({ data: payload }).then((response) => {
      if (response.payload.status === 200) {
        setQuery("");
        props.toggleSnackbar({ open: true, message: "Your request has been submitted successfully!", status: true });
      }
    });
  };

  return (
    <div>
      <Navbar />
      <div style={{ textAlign: "center", padding: "2rem", marginBottom: "2rem" }}>
        <Typography variant="h4" style={{ fontWeight: "600" }}>
          Need Help? We’re Here for You!
        </Typography>
        <Typography style={{ fontSize: "16px", marginTop: "0.5rem", color: "#555" }}>
          Describe your issue or query below, or explore the popular topics for quick solutions.
        </Typography>
      </div>
      <div
        style={{
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "80%",
          maxWidth: "600px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextField
          required
          placeholder="Type your query here"
          variant="outlined"
          size="medium"
          style={{ width: "100%" }}
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          style={{
            width: "100%",
            maxWidth: "200px",
            backgroundColor: "#0062AF",
            borderRadius: "5px",
            fontSize: "16px",
          }}
          onClick={handleSubmit}
          variant="contained"
        >
          Submit
        </Button>
      </div>
      {/* Popular Topics Section */}
      <div style={{ marginTop: "4rem", padding: "2rem", backgroundColor: "#f9f9f9", bottom: "0", position: "fixed", width: "100%" }}>
        <Typography variant="h5" style={{ fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
          Popular Topics
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card style={{ height: "100%" }}>
              <CardContent>
                <HelpOutlineIcon style={{ fontSize: "40px", color: "#0062AF", marginBottom: "1rem" }} />
                <Typography variant="h6" style={{ fontWeight: "600" }}>
                  Reset Your Password
                </Typography>
                <Typography style={{ color: "#555" }}>
                  Learn how to securely reset your account password in a few steps.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card style={{ height: "100%" }}>
              <CardContent>
                <HelpOutlineIcon style={{ fontSize: "40px", color: "#0062AF", marginBottom: "1rem" }} />
                <Typography variant="h6" style={{ fontWeight: "600" }}>
                  Account Settings
                </Typography>
                <Typography style={{ color: "#555" }}>
                  Manage your profile, preferences, and account settings efficiently.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card style={{ height: "100%" }}>
              <CardContent>
                <HelpOutlineIcon style={{ fontSize: "40px", color: "#0062AF", marginBottom: "1rem" }} />
                <Typography variant="h6" style={{ fontWeight: "600" }}>
                  Contact Support
                </Typography>
                <Typography style={{ color: "#555" }}>
                  Reach out to our support team for personalized assistance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  snackBarStatus: state.snackBarStatus,
  userDetails: state.userDetails,
});

const mapDispatchToProps = {
  toggleSnackbar,
  getUserDetails,
  createHelp,
};

export default connect(mapStateToProps, mapDispatchToProps)(HelpnSupport);
