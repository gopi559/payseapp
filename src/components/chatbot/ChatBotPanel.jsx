import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { HiXMark, HiChevronDown, HiChevronUp } from 'react-icons/hi2'
import Button from '../../Reusable/Button'
import { sendChat, retrievePreviousChat } from './chatbot.service'

const GREETING = { role: 'assistant', text: 'Hello! How can I help you today?' }

const normalizeHistoryMessage = (m) => ({
  role: m.role === 'user' ? 'user' : 'assistant',
  text: m.message || m.text || m.content || '',
})

const ChatBotPanel = ({ isOpen, onClose }) => {
  const user = useSelector((state) => state.auth?.user)
  const custId = user?.reg_info?.user_id ?? user?.reg_info?.id ?? user?.user_id ?? user?.id ?? ''
  const [previousMessages, setPreviousMessages] = useState([])
  const [showPreviousExpanded, setShowPreviousExpanded] = useState(false)
  const [sessionMessages, setSessionMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState('')
  const [isNewChat, setIsNewChat] = useState(true)
  const messagesEndRef = useRef(null)
  const panelRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && custId) {
      setLoadingHistory(true)
      setError('')
      setShowPreviousExpanded(false)
      retrievePreviousChat(custId)
        .then((res) => {
          const raw = Array.isArray(res?.data) ? res.data : []
          const history = raw.map(normalizeHistoryMessage).filter((m) => m.text)
          setPreviousMessages(history)
          if (history.length > 0) {
            setIsNewChat(false)
          }
          setSessionMessages([GREETING])
        })
        .catch(() => {
          setPreviousMessages([])
          setSessionMessages([GREETING])
          setIsNewChat(true)
        })
        .finally(() => setLoadingHistory(false))
    }
  }, [isOpen, custId])

  useEffect(() => {
    scrollToBottom()
  }, [previousMessages, sessionMessages, showPreviousExpanded])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || !custId) return
    setInput('')
    setError('')
    setSessionMessages((prev) => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await sendChat({
        cust_id: String(custId),
        message: text,
        new_chat: isNewChat,
      })
      setIsNewChat(false)
      const reply = res?.data?.message ?? res?.message ?? res?.response ?? 'No response.'
      setSessionMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      setError(err?.message || 'Something went wrong.')
      setSessionMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I could not process that. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const hasPrevious = previousMessages.length > 0
  const renderMessage = (m, i) => (
    <div
      key={i}
      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
          m.role === 'user'
            ? 'bg-brand-primary text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {m.text}
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className="fixed bottom-20 right-4 z-50 w-[min(100vw-2rem,380px)] rounded-2xl shadow-2xl border border-gray-200 bg-white flex flex-col overflow-hidden"
      style={{ maxHeight: '70vh' }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-brand-primary text-white shrink-0">
        <span className="font-semibold">Chat</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Close chat"
        >
          <HiXMark className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-[200px] p-4 space-y-3">
        {loadingHistory ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <>
            {hasPrevious && (
              <button
                type="button"
                onClick={() => setShowPreviousExpanded((v) => !v)}
                className="w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
              >
                <span>Previous conversations ({previousMessages.length})</span>
                {showPreviousExpanded ? (
                  <HiChevronUp className="w-4 h-4 shrink-0" />
                ) : (
                  <HiChevronDown className="w-4 h-4 shrink-0" />
                )}
              </button>
            )}
            {hasPrevious && showPreviousExpanded && (
              <div className="space-y-3 pb-2 border-b border-gray-100">
                {previousMessages.map((m, i) => renderMessage(m, `prev-${i}`))}
              </div>
            )}
            {sessionMessages.map((m, i) => renderMessage(m, `session-${i}`))}
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            disabled={loading || !custId}
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim() || !custId}>
            {loading ? '...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatBotPanel
