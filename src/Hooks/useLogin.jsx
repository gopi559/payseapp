import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUserType } from "../Redux/AuthToken";
import { login, setProfileImage } from "../Redux/store";
import { CHECK_MOBILE, GENERATE_OTP, VERIFY_OTP } from "../utils/constant";
import { fetchWithBasicAuth } from "../services/basicAuth.service.js";

const useLogin = () => {
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [forcePasswordUsername, setForcePasswordUsername] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sendOtpInFlightRef = useRef(false);
  const verifyOtpInFlightRef = useRef(false);

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
      const data = await fetchWithBasicAuth(CHECK_MOBILE, { mobile });
      if (!data?.exists) return { success: false, error: "Customer not found" };
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message };
    }
  };

  const sendOtp = async (mobile) => {
    if (!validateMobile(mobile)) return { success: false };
    if (sendOtpInFlightRef.current) return { success: false, error: "Request already in progress" };
    sendOtpInFlightRef.current = true;
    try {
      const checkData = await fetchWithBasicAuth(CHECK_MOBILE, { mobile });
      if (!checkData?.exists) {
        return { success: false, error: "Customer not found" };
      }

      await fetchWithBasicAuth(GENERATE_OTP, { mobile });

      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message };
    } finally {
      sendOtpInFlightRef.current = false;
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
    if (verifyOtpInFlightRef.current) return { success: false, error: "Request already in progress" };
    verifyOtpInFlightRef.current = true;

    try {
      const data = (await fetchWithBasicAuth(VERIFY_OTP, { mobile, otp })) || {};
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
    } finally {
      verifyOtpInFlightRef.current = false;
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
