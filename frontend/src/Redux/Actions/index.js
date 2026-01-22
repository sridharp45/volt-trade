import { createAsyncThunk } from "@reduxjs/toolkit";
import {createAPICall} from "../../API/baseAPI";
import * as types from "../types";
import * as config from "../../config/config";
import {database,ref,get} from '../../database/firebase'

export const createApiThunk = (name, apiConfig) => {
    return createAsyncThunk(name, async(actionParams, thunkAPI)=>{
    try {
        const {params, data, ...otherParams} = actionParams || {};
        const response = await createAPICall({
            ...apiConfig,
            params: {...apiConfig.params, ...params},
            data: Array.isArray(apiConfig.data) || Array.isArray(data)
            ? [...(apiConfig.data || []), ...apiCall(data || [])]
            : {...apiConfig.data, ...data},
            file:{...apiConfig.body,...params},
            ...otherParams
        });
        return response;
    }catch (error){
        return thunkAPI.rejectWithValue(error);
    }});
};

export const postLoginDetails = createApiThunk(types.POST_LOGIN_DETAILS,{
    method:"POST",
    url:config.POST_LOGIN_DETAILS_URL
})
export const postSignUpDetails = createApiThunk(types.POST_SIGNUP_DETAILS,{
    method:"POST",
    url:config.POST_SIGNUP_DETAILS_URL
})

export const putSignUpDetails = createApiThunk(types.POST_SIGNUP_DETAILS,{
    method:"PUT",
    url:config.GET_LOGIN_DETAILS_URL
})

export const getUserDetails = createApiThunk(types.GET_USER_DETAILS,{
    method:"GET",
    url:config.GET_LOGIN_DETAILS_URL
})
export const postAddVehicle = createApiThunk(types.POST_ADD_VEHICLE,{
    method:"POST",
    url:config.POST_ADD_VEHICLE_URL
})
export const postDeleteVehicle = createApiThunk(types.POST_DELETE_VEHICLE,{
    method:"POST",
    url:config.POST_DELETE_VEHICLE_URL
})
export const createPost = createApiThunk(types.POST_NEW_REQUEST,{
    method:"POST",
    url:config.POST_NEW_REQUEST_URL
})

export const getAllTrades = createApiThunk(types.GET_ALL_TRADES,{
    method:"GET",
    url:config.GET_ALL_TRADES_URL
})

export const deleteTrade = createApiThunk(types.DELETE_TRADE,{
    method:"DELETE",
    url:config.DELETE_TRADE_URL
})

export const acceptTrade = createApiThunk(types.PUT_ACCCEPT_DETAILS,{
    method:"PUT",
    url:config.PUT_ACCCEPT_DETAILS_URL
})

export const getAcceptedTrades = createApiThunk(types.GET_ACCEPT_DETAILS,{
    method:"GET",
    url:config.GET_ACCEPT_DETAILS_URL
})

export const cancelAcceptedTrade = createApiThunk(types.CANCEL_ACCEPT_TRADE,{
    method:"PUT",
    url:config.CANCEL_ACCEPT_TRADE_URL
})

export const preCheckTransaction = createApiThunk(types.PRE_CHECK_TRANSACTION,{
    method:"POST",
    url:config.PRE_CHECK_TRANSACTION_URL
})
export const initiateTransaction = createApiThunk(types.INITIATE_TRANSACTION,{
    method:"POST",
    url:config.INITIATE_TRANSACTION_URL
})
export const updateTransactionStats = createApiThunk(types.UPDATE_TRANSACTION,{
    method:"PUT",
    url:config.UPDATE_TRANSACTION_URL
})
export const getTransactionHistoryByUser = createApiThunk(types.USER_TRANSACTION_HISTORY,{
    method:"GET",
    url:config.USER_TRANSACTION_HISTORY_URL
})
export const getTransactionHistoryAdmin = createApiThunk(types.ADMIN_TRANSACTION_HISTORY,{
    method:"GET",
    url:config.ADMIN_TRANSACTION_HISTORY_URL
})

export const updateTransactionAdmin = createApiThunk(types.ADMIN_TRANSACTION_UPDATE,{
    method:"PUT",
    url:config.ADMIN_TRANSACTION_HISTORY_URL
})
export const editTrade = createApiThunk(types.EDIT_TRADE,{
    method:"POST",
    url:config.EDIT_TRADE_URL
})
export const checkTrnStatus = createApiThunk(types.CHECK_TRANSACTION_STATUS,{
    method:"POST",
    url:config.CHECK_TRANSACTION_STATUS_URL
})

export const createHelp = createApiThunk(types.CREATE_HELP,{
    method:"POST",
    url:config.CREATE_HELP_URL
})

export const updateHelp = createApiThunk(types.UPDATE_HELP,{
    method:"PUT",
    url:config.GET_HELP_URL
})

export const getAllHelp = createApiThunk(types.GET_HELP,{
    method:"GET",
    url:config.GET_HELP_URL
})

export const toggleSnackbar = (payload) => {
    return{
        type:types.TOGGLE_SNACKBAR,
        payload
    }
}

export const setVehicle = (payload) => {
    return{
        type:types.SET_VEHICLE,
        payload
    }
}

export const setTrade = (payload) => {
    return{
        type:types.SET_TRADE,
        payload
    }
}

export const carList = () => {
    return async (dispatch) =>{
        const carsRef = ref(database, 'cars_data');
        get(carsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    dispatch({
                        type:types.GET_CAR_LIST,
                        payload:data
                    })
                } else {
                    dispatch({
                        type:types.GET_CAR_LIST,
                        payload:{}
                    })
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                dispatch({
                    type:types.GET_CAR_LIST,
                    payload:{}
                })
            });
            dispatch({
                type:types.GET_CAR_LIST,
                payload:{}
            })
            getUserDetails({params:{userId:localStorage.getItem("userId")}})
    }
};