import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUserType } from "../Redux/AuthToken";
import { login, setProfileImage } from "../Redux/store";
import { CHECK_MOBILE, GENERATE_OTP, VERIFY_OTP } from "../utils/constant";
import { callApi } from "../services/api";

const useLogin = () => {
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [forcePasswordUsername, setForcePasswordUsername] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateMobile = (mobile) => {
    const digitsOnly = (mobile || "").replace(/\D/g, "");
    if (!mobile || digitsOnly.length < 10) {
      setErrors({ mobile: "Please enter a valid mobile number" });
      return false;
    }
    setErrors({});
    return true;
  };

  const checkMobile = async (mobile) => {
    if (!validateMobile(mobile)) return { success: false };
    try {
      const res = await callApi(CHECK_MOBILE, { mobile });
      const ok = res?.code === 1 || String(res?.status).toUpperCase() === "SUCCESS";
      if (!ok) return { success: false, error: res?.message };
      if (!res?.data?.exists) return { success: false, error: "Customer not found" };
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message };
    }
  };

  const sendOtp = async (mobile) => {
    if (!validateMobile(mobile)) return { success: false };
    try {
      const check = await callApi(CHECK_MOBILE, { mobile });
      const ok = check?.code === 1 || String(check?.status).toUpperCase() === "SUCCESS";
      if (!ok || !check?.data?.exists) {
        return { success: false, error: check?.message || "Customer not found" };
      }

      const otpRes = await callApi(GENERATE_OTP, { mobile });
      const otpOk = otpRes?.code === 1 || String(otpRes?.status).toUpperCase() === "SUCCESS";
      if (!otpOk) return { success: false, error: otpRes?.message };

      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message };
    }
  };

  const verifyOtp = async (mobile, otp) => {
    if (!mobile || !otp || String(otp).length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      setErrorMessage("Please enter a valid 6-digit OTP");
      setShowModal(true);
      return { success: false };
    }

    setErrors({});
    setErrorMessage("");

    try {
      const res = await callApi(VERIFY_OTP, { mobile, otp });
      const ok = res?.code === 1 || String(res?.status).toUpperCase() === "SUCCESS";
      if (!ok) {
        setErrorMessage(res?.message || "Invalid OTP");
        setShowModal(true);
        return { success: false };
      }

      const data = res?.data || {};
      const token = data?.token ?? null;
      const regInfo = data?.reg_info ?? {};
      const userType = regInfo?.user_type ?? 1;

      dispatch(setToken(token));
      dispatch(setUserType(userType));

      dispatch(
        login({
          user: {
            reg_info: regInfo,
            user_kyc: data?.user_kyc ?? null,
          },
          token,
        })
      );

      if (data?.img_id) {
        dispatch(setProfileImage({ id: data.img_id, url: null }));
      }

      navigate(userType === 1 ? "/customer/home" : "/corporate/dashboard");
      return { success: true };
    } catch (err) {
      setErrorMessage(err?.message || "Something went wrong");
      setShowModal(true);
      return { success: false };
    }
  };

  return {
    checkMobile,
    sendOtp,
    verifyOtp,
    errors,
    errorMessage,
    showModal,
    setShowModal,
    showForcePasswordModal,
    setShowForcePasswordModal,
    forcePasswordUsername,
    showSessionModal,
    setShowSessionModal,
  };
};

export default useLogin;