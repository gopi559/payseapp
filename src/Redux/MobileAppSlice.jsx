import { createSlice } from "@reduxjs/toolkit";


const MobileApp=createSlice({
    name:"mobileApp",
    initialState:{
        deviceId:"",
        deviceInfo:"",
        appChannel:"WEB",
        appName:"MobilWebApp",
        clientIp:"",
        locationStatus:"UNAVAILABLE",
        deviceLat:"",
        deviceLng:"",
    },
    reducers:{
        setDeviceId:(state,action)=>{
            state.deviceId=action.payload;
        },
        setDeviceInfo:(state,action)=>{
            state.deviceInfo=action.payload;
        },
        setAppChannel:(state,action)=>{
            state.appChannel=action.payload;
        },
        setAppName:(state,action)=>{
            state.appName=action.payload;
        },
        setClientIp:(state,action)=>{
            state.clientIp=action.payload;
        },
        setDeviceLocation:(state,action)=>{
            state.locationStatus=action.payload.locationStatus;
            state.deviceLat=action.payload.deviceLat;
            state.deviceLng=action.payload.deviceLng;
        },
        clearMobileAppData:(state)=>{
            state.deviceId="";
            state.deviceInfo="";
            state.appChannel="WEB";
            state.appName="MobilWebApp";
            state.clientIp="";
            state.locationStatus="UNAVAILABLE";
            state.deviceLat="";
            state.deviceLng="";
        }

    }
})


export const {
    setDeviceId,
    setDeviceInfo,
    setAppChannel,
    setAppName,
    setClientIp,
    setDeviceLocation,
    clearMobileAppData
    
}=MobileApp.actions


export default MobileApp.reducer

