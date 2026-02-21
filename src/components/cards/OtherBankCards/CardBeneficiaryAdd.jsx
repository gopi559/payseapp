import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HiCreditCard } from "react-icons/hi2";
import PageContainer from "../../../Reusable/PageContainer";
import Button from "../../../Reusable/Button";
import { getAuthToken, deviceId } from "../../../services/api";
import { BENIFICIARY_ADD } from "../../../utils/constant";
import THEME_COLORS from "../../../theme/colors";

const CardBeneficiaryAdd = () => {
  const navigate = useNavigate();
  const contentCard = THEME_COLORS.contentCard;
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [stan, setStan] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    const cardNum = cardNumber.trim().replace(/\s/g, "");
    if (!cardNum) e.cardNumber = "Required";
    else if (!/^\d{16}$/.test(cardNum)) e.cardNumber = "Must be 16 digits";
    if (!cardholderName?.trim()) e.cardholderName = "Required";
    const stanTrim = stan.trim();
    if (!stanTrim) e.stan = "Required";
    else if (!/^\d{6}$/.test(stanTrim)) e.stan = "Must be 6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill required fields");
      return;
    }
    const cardNum = cardNumber.trim().replace(/\s/g, "");
    const stanTrim = stan.trim();
    setLoading(true);
    try {
      const response = await fetch(BENIFICIARY_ADD, {
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
          card_number: cardNum,
          cardholder_name: cardholderName.trim(),
          stan: stanTrim,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.code !== 1) {
        throw new Error(result?.message || "Failed to add beneficiary");
      }
      toast.success(result?.message || "Beneficiary added");
      navigate("/customer/other-cards");
    } catch (err) {
      toast.error(err?.message || "Failed to add beneficiary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6 overflow-x-hidden">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: contentCard.iconBackground }}>
              <HiCreditCard className="w-6 h-6" style={{ color: contentCard.iconColor }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: contentCard.title }}>Add Card Beneficiary</h2>
              <p className="text-sm" style={{ color: contentCard.subtitle }}>Add an other bank card as beneficiary</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate("/customer/other-cards")}>
            Back to List
          </Button>
        </div>

        <div
          className="max-w-2xl p-6 rounded-lg shadow-sm overflow-hidden"
          style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full min-w-0">
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
              <div className="min-w-0">
                <label className="block font-medium mb-1.5 text-gray-700">Cardholder name *</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => {
                    setCardholderName(e.target.value);
                    if (errors.cardholderName) setErrors({ ...errors, cardholderName: null });
                  }}
                  placeholder="Name on card"
                  className={`w-full border border-gray-300 p-2 rounded outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-800 min-w-0 ${errors.cardholderName ? "border-red-500" : ""}`}
                />
                {errors.cardholderName && <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
              </div>
              <div className="min-w-0">
                <label className="block font-medium mb-1.5 text-gray-700">STAN (6 digits) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={stan}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setStan(v);
                    if (errors.stan) setErrors({ ...errors, stan: null });
                  }}
                  placeholder="6 digit STAN"
                  className={`w-full border border-gray-300 p-2 rounded outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-800 min-w-0 ${errors.stan ? "border-red-500" : ""}`}
                />
                {errors.stan && <p className="text-red-500 text-xs mt-1">{errors.stan}</p>}
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
    </PageContainer>
  );
};

export default CardBeneficiaryAdd;
