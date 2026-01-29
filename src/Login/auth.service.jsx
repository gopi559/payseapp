import Store from "../Redux/store.jsx";
import { login, logout } from "../Redux/store.jsx";
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

      if (!(check?.code === 1 || check?.status === "SUCCESS")) {
        return { success: false, error: check?.message };
      }

      if (!check?.data?.exists) {
        return { success: false, error: "Customer not found" };
      }

      const otpRes = await callApi(GENERATE_OTP, { mobile });

      if (!(otpRes?.code === 1 || otpRes?.status === "SUCCESS")) {
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

      if (!(res?.code === 1 || res?.status === "SUCCESS")) {
        return { success: false, error: res?.message };
      }

      Store.dispatch(
        login({
          user: res?.data?.reg_info || {},
          token: res?.data?.token || null,
        })
      );

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
