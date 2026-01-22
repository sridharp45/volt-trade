import React, { useEffect, useState } from "react";
import { Grid, Slide, Icon, Typography } from "@mui/material";
import GreenTick from "../assets/Images/greenTick.svg";
import Cross from "../assets/Images/cross.svg";
import { Snackbar } from "@mui/material";
import { connect, useDispatch, useSelector } from "react-redux";
import { toggleSnackbar } from "../../Redux/Actions";

const SnackbarComp = (props) => {
  const dispatch = useDispatch();
  const snackbarInfo = useSelector((state) => state.snackBarStatus);
  const handleClose = () => {
    dispatch(toggleSnackbar({ open: false, message: snackbarInfo.message, status: snackbarInfo.status }));
  };

  return (
    <>
      <Snackbar
        open={snackbarInfo.open}
        autoHideDuration={3000}
        onClose={()=>handleClose()}
        style={{ transition: ".5s ease-in-out", marginTop: "10px" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >

        <Slide in={true} style={{ transformOrigin: "0 0 10" }}>
          <Grid
            style={{
              display: "flex",
              borderRadius: "10px",
              backgroundColor: snackbarInfo.status ? "#cefad0" : "#f94449",
              padding: "10px",
            }}
          >
            <Icon style={{ display: "inline-flex", alignItems: "center" }} 
            >
              {snackbarInfo.status && (
                <img src={GreenTick} alt="snackbar" style={{ width: "100%" }} />
              )}
              {!snackbarInfo.status && (
                <img src={Cross} alt="snackbar" style={{ width: "100%" }} />
              )}
            </Icon>
            <Typography
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginLeft: "10px",
                fontWeight: "700",
                color: snackbarInfo.status ? "green" : "white",
              }}
            >
              {snackbarInfo.message}
            </Typography>
          </Grid>
        </Slide>
      </Snackbar>
    </>
  );
}

export default SnackbarComp;