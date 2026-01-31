import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HiCreditCard } from "react-icons/hi2";
import PageContainer from "../../Reusable/PageContainer";
import Button from "../../Reusable/Button";
import { callApi } from "../../services/api";
import { CARD_REQUEST_TYPE_LIST, CARD_REQUEST } from "../../utils/constant";

const CardRequest = () => {
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [requestType, setRequestType] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await callApi(CARD_REQUEST_TYPE_LIST, {});
        if (res?.code === 1) setTypes(res.data || []);
      } catch {
        toast.error("Failed to load card request types");
      }
    };

    loadTypes();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!requestType) newErrors.requestType = "Required";
    if (!nameOnCard) newErrors.nameOnCard = "Required";

    if (Object.keys(newErrors).length !== 0) {
      toast.error("Please fill mandatory fields");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await callApi(CARD_REQUEST, {
        request_type: Number(requestType),
        name_on_card: nameOnCard.trim(),
        remarks,
      });

      if (res?.code !== 1) throw new Error(res?.message);

      toast.success(res?.message || "Card request processed successfully");

      setTimeout(() => {
        navigate("/customer/cards");
      }, 800);

    } catch (err) {
      toast.error(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="px-4 py-6 w-full flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <HiCreditCard className="w-6 h-6 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Card Request
            </h2>
            <p className="text-sm text-gray-500">
              Request a new or replacement card
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="w-full bg-white rounded-lg shadow-sm p-6">
          <div className="max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Type
              </label>

              <select
                value={requestType}
                onChange={(e) => {
                  setRequestType(e.target.value);
                  if (errors.requestType) setErrors({ ...errors, requestType: null });
                }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm ${
                  errors.requestType ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">Select request type</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.request_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Name on Card */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name on Card
              </label>

              <input
                value={nameOnCard}
                onChange={(e) => {
                  setNameOnCard(e.target.value);
                  if (errors.nameOnCard) setErrors({ ...errors, nameOnCard: null });
                }}
                placeholder="Enter name as it should appear"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm ${
                  errors.nameOnCard ? "border-red-500" : "border-gray-200"
                }`}
              />
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>

              <textarea
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional notes"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-y"
              />
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>

            <Button type="button" onClick={() => navigate("/customer/cards")}>
              Back
            </Button>
          </div>

        </div>
      </div>
    </PageContainer>
  );
};

export default CardRequest;
