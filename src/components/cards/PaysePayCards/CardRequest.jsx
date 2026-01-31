import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HiCreditCard } from "react-icons/hi2";
import PageContainer from "../../../Reusable/PageContainer";
import Button from "../../../Reusable/Button";
import { getAuthToken, deviceId } from "../../../services/api";
import { CARD_REQUEST_TYPE_LIST, CARD_REQUEST } from "../../../utils/constant";
import { cardService } from "./card.service";

// Request type ids that require a reference card (Reissue, Addon)
const REFERENCE_CARD_TYPES = [2, 3]; // 2 = Reissue Card, 3 = Addon Card

const CardRequest = () => {
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [cards, setCards] = useState([]);
  const [requestType, setRequestType] = useState("");
  const [referenceCardId, setReferenceCardId] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCardRequestTypes = async () => {
      try {
        const response = await fetch(CARD_REQUEST_TYPE_LIST, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
            deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const responseData = await response.json();
        if (responseData?.code === 1 && responseData?.data) {
          setTypes(responseData.data);
        }
      } catch (error) {
        console.error("Error fetching card request types:", error);
        toast.error("Failed to load card request types");
      }
    };

    fetchCardRequestTypes();
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      setLoadingCards(true);
      try {
        const { data } = await cardService.getList({ page: 1, num_data: 100 });
        setCards(Array.isArray(data) ? data : []);
      } catch {
        setCards([]);
      } finally {
        setLoadingCards(false);
      }
    };
    fetchCards();
  }, []);

  const needsReferenceCard = REFERENCE_CARD_TYPES.includes(Number(requestType));

  useEffect(() => {
    if (!needsReferenceCard) setReferenceCardId("");
  }, [needsReferenceCard]);

  const validateForm = () => {
    const newErrors = {};

    if (!requestType) newErrors.requestType = "Required";
    if (!nameOnCard) newErrors.nameOnCard = "Required";
    if (needsReferenceCard && !referenceCardId) {
      newErrors.referenceCardId = "Please select the reference card";
    }

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
      const body = {
        request_type: Number(requestType),
        name_on_card: nameOnCard.trim(),
        remarks,
      };
      if (needsReferenceCard && referenceCardId) {
        body.reference_card = Number(referenceCardId);
      }

      const response = await fetch(CARD_REQUEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
          DeviceID: deviceId,
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseData?.message || "Network response was not ok");
      }
      if (responseData?.code !== 1) {
        throw new Error(responseData?.message || "Request failed");
      }

      toast.success(responseData?.message || "Card request processed successfully");

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
                  if (errors.referenceCardId) setErrors({ ...errors, referenceCardId: null });
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

            {/* Reference Card – shown only for Reissue / Addon */}
            {needsReferenceCard && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference card <span className="text-red-500">*</span>
                </label>
                <select
                  value={referenceCardId}
                  onChange={(e) => {
                    setReferenceCardId(e.target.value);
                    if (errors.referenceCardId) setErrors({ ...errors, referenceCardId: null });
                  }}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm ${
                    errors.referenceCardId ? "border-red-500" : "border-gray-200"
                  }`}
                  disabled={loadingCards}
                >
                  <option value="">
                    {loadingCards ? "Loading cards..." : "Select the card (Reissue/Addon)"}
                  </option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.masked_card || `Card ****`} – {c.name_on_card || "—"}
                    </option>
                  ))}
                </select>
                {errors.referenceCardId && (
                  <p className="text-red-500 text-xs mt-1">{errors.referenceCardId}</p>
                )}
              </div>
            )}

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
