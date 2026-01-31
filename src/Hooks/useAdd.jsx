import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useTokenRefresh from "../Hooks/useTokenRefresh";
import { useTranslation } from "react-i18next";

const useAdd = (apiEndpoint, redirectPath) => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const token = useSelector((store) => store.token.token);
  const deviceId = useSelector((store) => store.token.deviceId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { fetchWithTokenRefresh } = useTokenRefresh();
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (payload) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const response = await fetchWithTokenRefresh(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          DeviceID: deviceId,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.code === 0) {
        throw new Error(
          responseData.message || `Error: ${response.statusText}`
        );
      }

      setSuccessMessage(t("Created Successfully"));
      setTimeout(() => navigate(redirectPath), 50);
    } catch (err) {
      setError(err.message ? err.message : t("Failed To Create"));
      setTimeout(() => navigate(redirectPath), 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error]);

  return { handleAddSubmit, isSubmitting, error, successMessage };
};

export default useAdd;
