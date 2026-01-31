import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { HiCreditCard } from "react-icons/hi2";
import PageContainer from "../../../Reusable/PageContainer";
import Button from "../../../Reusable/Button";
import { getAuthToken, deviceId } from "../../../services/api";
import { BENIFICIARY_EDIT } from "../../../utils/constant";

const CardBeneficiaryEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const row = location.state?.row ?? null;
  const [cardNumber, setCardNumber] = useState(row?.card_number ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (row) setCardNumber(row.card_number ?? "");
  }, [row]);

  const validate = () => {
    const e = {};
    const cardNum = cardNumber.trim().replace(/\s/g, "");
    if (!cardNum) e.cardNumber = "Required";
    else if (!/^\d{16}$/.test(cardNum)) e.cardNumber = "Must be 16 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      toast.error("Invalid beneficiary");
      return;
    }
    if (!validate()) {
      toast.error("Please fill required fields");
      return;
    }
    const cardNum = cardNumber.trim().replace(/\s/g, "");
    setLoading(true);
    try {
      const response = await fetch(BENIFICIARY_EDIT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
                  deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
        },
        body: JSON.stringify({
          card_beneficiary_id: Number(id),
          card_number: cardNum,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.code !== 1) {
        throw new Error(result?.message || "Failed to update beneficiary");
      }
      toast.success(result?.message || "Beneficiary updated");
      navigate("/customer/other-cards");
    } catch (err) {
      toast.error(err?.message || "Failed to update beneficiary");
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <PageContainer>
        <div className="px-4 py-6 bg-gray-50 min-h-full">
          <p className="text-gray-600">Invalid beneficiary.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/customer/other-cards")}>
            Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="bg-gray-50 min-h-full px-4 py-6 overflow-x-hidden flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <HiCreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Edit Card Beneficiary</h2>
                <p className="text-sm text-gray-500">
                  {row?.masked_card ? `Card: ${row.masked_card}` : "Update beneficiary details"}
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => navigate("/customer/other-cards")}>
              Back to List
            </Button>
          </div>

          <div className="border border-gray-200 bg-white p-6 rounded-lg shadow-sm overflow-hidden">
          {row?.masked_card && (
            <p className="text-sm text-gray-600 mb-4">
              Beneficiary: {row.masked_card}
              {row?.cardholder_name && ` · ${row.cardholder_name}`}
            </p>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-6 w-full min-w-0">
              <div className="min-w-0">
                <label className="block font-medium mb-1.5 text-gray-700">Card number (16 digits) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setCardNumber(v);
                    if (errors.cardNumber) setErrors({ ...errors, cardNumber: null });
                  }}
                  placeholder="16 digit card number"
                  className={`w-full border border-gray-300 p-2 rounded outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-800 min-w-0 ${errors.cardNumber ? "border-red-500" : ""}`}
                />
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
              </div>
            </div>
            <div className="flex flex-row mt-7 gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/customer/other-cards")}>
                Cancel
              </Button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default CardBeneficiaryEdit;
