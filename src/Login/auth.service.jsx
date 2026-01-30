import Store from "../Redux/store.jsx";
import { login, logout, setWalletId } from "../Redux/store.jsx";
import { callApi } from "../services/api.js";
import { CHECK_MOBILE, GENERATE_OTP, VERIFY_OTP } from "../utils/constant.jsx";
import { cacheCurrentLocation } from "../utils/deviceLocation.js";

export const authService = {
  sendOtp: async (mobile) => {
    try {
      cacheCurrentLocation({ timeoutMs: 5000 }).catch(() => {});

      const check = await callApi(CHECK_MOBILE, {
        mobile,
        entity: "mobile",
      });

      if (!(check?.code === 1 || String(check?.status).toUpperCase() === "SUCCESS")) {
        return { success: false, error: check?.message };
      }

      if (!check?.data?.exists) {
        return { success: false, error: "Customer not found" };
      }

      const otpRes = await callApi(GENERATE_OTP, { mobile });

      if (!(otpRes?.code === 1 || String(otpRes?.status).toUpperCase() === "SUCCESS")) {
        return { success: false, error: otpRes?.message };
      }

      return { success: true, data: otpRes?.data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  verifyOtp: async (mobile, otp) => {
    try {
      cacheCurrentLocation({ timeoutMs: 5000 }).catch(() => {});

      const res = await callApi(VERIFY_OTP, { mobile, otp });

      if (!(res?.code === 1 || String(res?.status).toUpperCase() === "SUCCESS")) {
        return { success: false, error: res?.message };
      }

      const regInfo = res?.data?.reg_info || {};
      Store.dispatch(
        login({
          user: {
            reg_info: regInfo,
            user_kyc: res?.data?.user_kyc || null,
            mfa_id: res?.data?.mfa_id,
            session_expiry_timeout: res?.data?.session_expiry_timeout,
            session_expiry_unit: res?.data?.session_expiry_unit,
            user_inactivity_timeout: res?.data?.user_inactivity_timeout,
          },
          token: res?.data?.token || null,
        })
      );
      if (regInfo?.user_ref) {
        Store.dispatch(setWalletId(regInfo.user_ref));
      }

      return { success: true, data: res?.data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  logout: () => {
    Store.dispatch(logout());
    localStorage.removeItem("reduxState");
  },
};
