import Store from "../Redux/store.jsx";
import { login, logout, setWalletId, setBalance, setProfileImage } from "../Redux/store.jsx";
import { clearUserDataAuth } from "../Redux/AuthToken.jsx";
import { callApi, clearAuthRuntime } from "../services/api.jsx";
import { fetchWithBasicAuth } from "../services/basicAuth.service.js";
import {
  CHECK_MOBILE,
  GENERATE_OTP,
  VERIFY_OTP,
  CUSTOMER_BALANCE,
} from "../utils/constant.jsx";
import { cacheCurrentLocation } from "../utils/deviceLocation.jsx";

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

      const checkData = await fetchWithBasicAuth(CHECK_MOBILE, {
        mobile,



        
        entity: "mobile",
      });

      if (!checkData?.exists) {
        return { success: false, error: "Customer not found" };
      }

      const otpData = await fetchWithBasicAuth(GENERATE_OTP, { mobile });

      return { success: true, data: otpData };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  verifyOtp: async (mobile, otp) => {
    try {
      cacheCurrentLocation({ timeoutMs: 5000 }).catch(() => {});

      const data = (await fetchWithBasicAuth(VERIFY_OTP, { mobile, otp })) || {};
      const regInfo = data?.reg_info || {};

      Store.dispatch(
        login({
          user: {
            reg_info: regInfo,
            user_kyc: data?.user_kyc || null,
            mfa_id: data?.mfa_id,
            session_expiry_timeout: data?.session_expiry_timeout,
            session_expiry_unit: data?.session_expiry_unit,
            user_inactivity_timeout: data?.user_inactivity_timeout,
          },
          token: data?.token || null,
        })
      );

      if (data?.img_id) {
        Store.dispatch(setProfileImage({ id: data.img_id, url: null }));
      } else if (data?.img_url) {
        Store.dispatch(setProfileImage({ id: null, url: data.img_url }));
      }

      if (regInfo?.user_ref) {
        Store.dispatch(setWalletId(regInfo.user_ref));
      }

      await fetchCustomerBalance();

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  logout: () => {
    Store.dispatch(logout());
    Store.dispatch(clearUserDataAuth());
    Store.dispatch(setBalance(0));
    Store.dispatch(setWalletId(""));
    Store.dispatch(setProfileImage({ id: null, url: null }));

    clearAuthRuntime();

    localStorage.removeItem("reduxState");
    localStorage.removeItem("refreshToken");
  },

  fetchCustomerBalance,
};

export default authService;
