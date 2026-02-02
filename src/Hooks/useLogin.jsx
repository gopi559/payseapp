import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUserType } from "../Redux/AuthToken";
import { login } from "../Redux/store";
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
    if (!validateMobile(mobile)) return { success: false, error: "Invalid mobile" };
    try {
      const res = await callApi(CHECK_MOBILE, { mobile });
      const ok = res?.code === 1 || String(res?.status).toUpperCase() === "SUCCESS";
      if (!ok) return { success: false, error: res?.message || "Check failed" };
      if (!res?.data?.exists) return { success: false, error: "Customer not found" };
      return { success: true, data: res?.data };
    } catch (err) {
      const msg = err?.payload?.message || err?.message || "Something went wrong.";
      return { success: false, error: msg };
    }
  };

  const sendOtp = async (mobile) => {
    if (!validateMobile(mobile)) return { success: false, error: "Invalid mobile" };
    try {
      const check = await callApi(CHECK_MOBILE, { mobile });
      const checkOk = check?.code === 1 || String(check?.status).toUpperCase() === "SUCCESS";
      if (!checkOk) return { success: false, error: check?.message || "Check failed" };
      if (!check?.data?.exists) return { success: false, error: "Customer not found" };

      const otpRes = await callApi(GENERATE_OTP, { mobile });
      const otpOk = otpRes?.code === 1 || String(otpRes?.status).toUpperCase() === "SUCCESS";
      if (!otpOk) return { success: false, error: otpRes?.message || "Failed to send OTP" };
      return { success: true, data: otpRes?.data };
    } catch (err) {
      const msg = err?.payload?.message || err?.message || "Something went wrong.";
      return { success: false, error: msg };
    }
  };

  const verifyOtp = async (mobile, otp) => {
    if (!mobile || !otp || String(otp).length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      setErrorMessage("Please enter a valid 6-digit OTP");
      setShowModal(true);
      return { success: false, error: "Please enter a valid 6-digit OTP" };
    }
    setErrors({});
    setErrorMessage("");
    try {
      const res = await callApi(VERIFY_OTP, { mobile, otp });
      const ok = res?.code === 1 || String(res?.status).toUpperCase() === "SUCCESS";
      if (!ok) {
        const msg = res?.message || "Invalid OTP";
        setErrorMessage(msg);
        setShowModal(true);
        return { success: false, error: msg };
      }

      const data = res?.data || {};
      const token = data?.token ?? null;
      const user = data?.user ?? data?.reg_info ?? {};
      const userType = user?.user_type ?? 1;

      dispatch(setToken(token));
      dispatch(setUserType(userType));
      dispatch(
        login({
          user: { ...user, reg_info: data?.reg_info || {} },
          token,
        })
      );
      if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

      if (userType === 1) {
        navigate("/customer/home");
      } else {
        navigate("/corporate/dashboard");
      }
      return { success: true, data };
    } catch (err) {
      const msg = err?.payload?.message || err?.message || "Something went wrong.";
      setErrorMessage(msg);
      setShowModal(true);
      return { success: false, error: msg };
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
