import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useTokenRefresh from "../Hooks/useTokenRefresh";
import { useTranslation } from "react-i18next";

const useEdit = (url) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const token = useSelector((store) => store.token.token);
  const deviceId = useSelector((store) => store.token.deviceId);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchWithTokenRefresh } = useTokenRefresh();

  const handleEditSubmit = async (payload, successRedirectUrl) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetchWithTokenRefresh(url, {
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

      setSuccessMessage(t("Update Successfull"));
      setTimeout(() => navigate(successRedirectUrl), 50);
    } catch (err) {
      setError(err.message ? err.message : t("Update Failed"));
      setTimeout(() => navigate(successRedirectUrl), 50);
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

  return {
    handleEditSubmit,
    isSubmitting,
    error,
    successMessage,
  };
};

export default useEdit;
