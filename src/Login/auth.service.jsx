import Store from "../Redux/store.jsx";
import { login, logout, setWalletId, setBalance } from "../Redux/store.jsx";
import { callApi } from "../services/api.jsx";
import {
  CHECK_MOBILE,
  GENERATE_OTP,
  VERIFY_OTP,
  CUSTOMER_BALANCE,
} from "../utils/constant.jsx";
import { cacheCurrentLocation } from "../utils/deviceLocation.jsx";

/** Fetch customer balance from /account/cust_bal and update Redux wallet (balance + acct_number). */
const fetchCustomerBalance = async () => {
  try {
    const res = await callApi(CUSTOMER_BALANCE, {});
    if (res?.code === 1 && res?.data) {
      const { avail_bal, acct_number } = res.data;
      Store.dispatch(setBalance(Number(avail_bal) ?? 0));
      if (acct_number != null) Store.dispatch(setWalletId(String(acct_number)));
      return res.data;
    }
    return null;
  } catch {
    return null;
  }
};

const authService = {
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

      await fetchCustomerBalance();

      return { success: true, data: res?.data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  logout: () => {
    Store.dispatch(logout());
    Store.dispatch(setBalance(0));
    Store.dispatch(setWalletId(""));
    localStorage.removeItem("reduxState");
  },
};

export { fetchCustomerBalance }
export default authService
