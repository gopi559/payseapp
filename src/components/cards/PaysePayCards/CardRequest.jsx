import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { HiCreditCard } from "react-icons/hi2"
import PageContainer from "../../../Reusable/PageContainer"
import Button from "../../../Reusable/Button"
import { getAuthToken, deviceId } from "../../../services/api"
import { CARD_REQUEST_TYPE_LIST, CARD_REQUEST } from "../../../utils/constant"
import cardService from "./card.service"

const REFERENCE_CARD_TYPES = [2, 3]

const CardRequest = () => {
  const navigate = useNavigate()

  const [types, setTypes] = useState([])
  const [cards, setCards] = useState([])
  const [requestType, setRequestType] = useState("")
  const [referenceCardId, setReferenceCardId] = useState("")
  const [nameOnCard, setNameOnCard] = useState("")
  const [remarks, setRemarks] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingCards, setLoadingCards] = useState(false)
  const [errors, setErrors] = useState({})

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
        })

        if (!response.ok) throw new Error("Failed to load card request types")

        const res = await response.json().catch(() => null)
        if (res?.code === 1 && res?.data) setTypes(res.data)
      } catch {
        toast.error("Failed to load card request types")
      }
    }

    fetchCardRequestTypes()
  }, [])

  useEffect(() => {
    const fetchCards = async () => {
      setLoadingCards(true)
      try {
        const { data } = await cardService.getList({ page: 1, num_data: 100 })
        setCards(Array.isArray(data) ? data : [])
      } catch {
        setCards([])
      } finally {
        setLoadingCards(false)
      }
    }

    fetchCards()
  }, [])

  const needsReferenceCard = REFERENCE_CARD_TYPES.includes(Number(requestType))

  useEffect(() => {
    if (!needsReferenceCard) setReferenceCardId("")
  }, [needsReferenceCard])

  const validateForm = () => {
    const newErrors = {}

    if (!requestType) newErrors.requestType = "Required"
    if (!nameOnCard) newErrors.nameOnCard = "Required"
    if (needsReferenceCard && !referenceCardId) newErrors.referenceCardId = "Required"

    if (Object.keys(newErrors).length) toast.error("Please fill mandatory fields")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const body = {
        request_type: Number(requestType),
        name_on_card: nameOnCard.trim(),
        remarks,
        reference_card: needsReferenceCard ? Number(referenceCardId) : undefined,
      }

      const response = await fetch(CARD_REQUEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
          deviceInfo: JSON.stringify({
            device_type: "WEB",
            device_id: deviceId,
          }),
        },
        body: JSON.stringify(body),
      })

      const res = await response.json().catch(() => null)
      if (!response.ok) throw new Error("Request failed")
      if (res?.code !== 1) throw new Error("Request failed")

      toast.success("Card request processed successfully")

      setTimeout(() => navigate("/customer/cards"), 800)
    } catch {
      toast.error("Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="px-4 py-6 w-full flex flex-col gap-4">

        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <HiCreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Card Request</h2>
            <p className="text-sm text-gray-500">Request a new or replacement card</p>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm p-6">
          <div className="max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm ${
                  errors.requestType ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">Select request type</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.request_type}</option>
                ))}
              </select>
            </div>

            {needsReferenceCard && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference card</label>
                <select
                  value={referenceCardId}
                  onChange={(e) => setReferenceCardId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm"
                  disabled={loadingCards}
                >
                  <option value="">{loadingCards ? "Loading..." : "Select card"}</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.masked_card} – {c.name_on_card}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <input
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
            <Button onClick={() => navigate("/customer/cards")}>Back</Button>
          </div>

        </div>
      </div>
    </PageContainer>
  )
}

export default CardRequest
