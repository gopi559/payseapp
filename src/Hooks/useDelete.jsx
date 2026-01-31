import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useTokenRefresh from "../Hooks/useTokenRefresh";
import { useTranslation } from "react-i18next";

const useDelete = (deleteUrl) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const token = useSelector((store) => store.token.token);
  const deviceId = useSelector((store) => store.token.deviceId);
  const navigate = useNavigate();
  const { fetchWithTokenRefresh } = useTokenRefresh();
  const { t } = useTranslation();

  const handleDelete = async (payload, successRedirectUrl) => {
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetchWithTokenRefresh(deleteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          DeviceID: deviceId,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.code === 0) {
        throw new Error(data.message || "Failed to delete");
      }

      setSuccessMessage(t("Deleted Successfully"));
      console.log(`Navigating to: ${successRedirectUrl}`);
      setTimeout(() => navigate(successRedirectUrl), 50);
    } catch (err) {
      setError(t("Deletion Failed"));
      console.log(`Error occurred. Navigating to: ${successRedirectUrl}`);
      setTimeout(() => navigate(successRedirectUrl), 50);
    } finally {
      setIsDeleting(false);
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
    handleDelete,
    isDeleting,
    error,
    successMessage,
  };
};

export default useDelete;
