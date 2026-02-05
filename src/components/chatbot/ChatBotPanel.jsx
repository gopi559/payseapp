import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { HiXMark } from 'react-icons/hi2'
import Button from '../../Reusable/Button'
import chatbotService from './chatbot.service'

const GREETING = { role: 'assistant', text: 'Hello! How can I help you today?' }

/** Format chat timestamp as dd/mm/yyyy, hh:mm am/pm */
const formatChatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${day}/${month}/${year}, ${time}`
}

const normalizeHistoryMessage = (m) => ({
  role: m.role === 'user' ? 'user' : 'assistant',
  text: m.message || m.text || m.content || '',
  timestamp: m.created_on || m.timestamp || m.created_at || null,
})

const parsePreviousChatResponse = (res) => {
  const sessions = res?.chat_sessions || res?.data?.chat_sessions
  if (Array.isArray(sessions) && sessions.length > 0) {
    const withTimestamp = []
    sessions.forEach((session) => {
      const list = session?.messages || []
      list.forEach((msg) => {
        const text = msg?.message || msg?.text || msg?.content || ''
        if (!text) return
        const role = msg?.sender === 'user' ? 'user' : 'assistant'
        const ts = msg?.created_at || msg?.created_on || msg?.timestamp || null
        withTimestamp.push({ role, text, timestamp: ts, _sortKey: ts ? new Date(ts).getTime() : 0 })
      })
    })
    withTimestamp.sort((a, b) => a._sortKey - b._sortKey)
    return withTimestamp.map(({ role, text, timestamp }) => ({ role, text, timestamp }))
  }
  const raw = Array.isArray(res?.data) ? res.data : []
  return raw.map(normalizeHistoryMessage).filter((m) => m.text)
}

const SCROLL_TOP_THRESHOLD = 80
const LOAD_MORE_COOLDOWN_MS = 800
const PREVIOUS_PAGE_SIZE = 15

const ChatBotPanel = ({ isOpen, onClose }) => {
  const user = useSelector((state) => state.auth?.user)
  const custId = user?.reg_info?.user_id ?? user?.reg_info?.id ?? user?.user_id ?? user?.id ?? ''
  const [allFetchedPrevious, setAllFetchedPrevious] = useState([])
  const [displayedPreviousCount, setDisplayedPreviousCount] = useState(0)
  const [sessionMessages, setSessionMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [isNewChat, setIsNewChat] = useState(true)
  const messagesEndRef = useRef(null)
  const panelRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const loadMoreCooldownRef = useRef(false)
  const hasFetchedRef = useRef(false)
  const scrollRestoreRef = useRef(null)

  const previousMessages = allFetchedPrevious.slice(0, displayedPreviousCount)
  const hasMorePrevious = displayedPreviousCount < allFetchedPrevious.length

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchPreviousMessages = useCallback(() => {
    if (!custId || custId === '0' || custId === '') return
    setLoadingMore(true)
    setError('')
    chatbotService.retrievePreviousChat(custId)
      .then((res) => {
        const responseData = res?.data || res
        const history = parsePreviousChatResponse(responseData)
        setAllFetchedPrevious(history)
        setDisplayedPreviousCount(Math.min(PREVIOUS_PAGE_SIZE, history.length))
        if (history.length > 0) {
          setIsNewChat(false)
        }
      })
      .catch(() => {
        setAllFetchedPrevious([])
        setDisplayedPreviousCount(0)
      })
      .finally(() => setLoadingMore(false))
  }, [custId])

  useEffect(() => {
    if (isOpen && custId) {
      setSessionMessages([{ ...GREETING, timestamp: new Date().toISOString() }])
      setAllFetchedPrevious([])
      setDisplayedPreviousCount(0)
      setError('')
      hasFetchedRef.current = true
      fetchPreviousMessages()
    }
  }, [isOpen, custId, fetchPreviousMessages])

  const loadMorePrevious = useCallback(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      loadMoreCooldownRef.current = true
      fetchPreviousMessages()
      setTimeout(() => {
        loadMoreCooldownRef.current = false
      }, LOAD_MORE_COOLDOWN_MS)
      return
    }
    if (!hasMorePrevious || loadingMore) return
    const el = scrollContainerRef.current
    if (el) {
      scrollRestoreRef.current = { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop }
    }
    setDisplayedPreviousCount((prev) => Math.min(prev + PREVIOUS_PAGE_SIZE, allFetchedPrevious.length))
    loadMoreCooldownRef.current = true
    setTimeout(() => {
      loadMoreCooldownRef.current = false
    }, LOAD_MORE_COOLDOWN_MS)
  }, [hasMorePrevious, loadingMore, allFetchedPrevious.length, fetchPreviousMessages])

  useEffect(() => {
    const saved = scrollRestoreRef.current
    if (!saved || !scrollContainerRef.current) return
    const el = scrollContainerRef.current
    const raf = requestAnimationFrame(() => {
      const newHeight = el.scrollHeight
      el.scrollTop = saved.scrollTop + (newHeight - saved.scrollHeight)
    })
    scrollRestoreRef.current = null
    return () => cancelAnimationFrame(raf)
  }, [displayedPreviousCount])

  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el || !custId || loadMoreCooldownRef.current) return
    if (el.scrollTop <= SCROLL_TOP_THRESHOLD) {
      loadMorePrevious()
    }
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [previousMessages, sessionMessages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || !custId) return
    setInput('')
    setError('')
    const now = new Date().toISOString()
    setSessionMessages((prev) => [...prev, { role: 'user', text, timestamp: now }])
    setLoading(true)
    try {
      const res = await chatbotService.sendChat({
        cust_id: String(custId),
        message: text,
        new_chat: isNewChat,
      })
      setIsNewChat(false)
      const reply = res?.response ?? res?.data?.response ?? res?.data?.message ?? res?.message ?? 'No response.'
      setSessionMessages((prev) => [...prev, { role: 'assistant', text: reply, timestamp: new Date().toISOString() }])
      setTimeout(() => {
        fetchPreviousMessages()
      }, 500)
    } catch (err) {
      setError(err?.message || 'Something went wrong.')
      setSessionMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I could not process that. Please try again.', timestamp: new Date().toISOString() }])
    } finally {
      setLoading(false)
    }
  }

  const hasPrevious = previousMessages.length > 0

  const renderBotText = (text) => {
    if (!text) return null

    const sections = text.split('\n\n')

    return sections.map((section, idx) => {
      if (section.trim().startsWith('-')) {
        const items = section.split('\n').map((l) => l.replace(/^- /, '').trim()).filter((it) => it)
        return (
          <ul key={idx} className="list-disc pl-4 space-y-1">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        )
      }

      return (
        <p key={idx} className="whitespace-pre-line mb-2 last:mb-0">
          {section}
        </p>
      )
    })
  }

  const renderMessage = (m, i) => (
    <div
      key={i}
      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
          m.role === 'user'
            ? 'bg-brand-primary text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {m.role === 'assistant' ? renderBotText(m.text) : m.text}
      </div>
      {formatChatTime(m.timestamp) && (
        <span className="mt-0.5 text-[10px] text-gray-400">
          {formatChatTime(m.timestamp)}
        </span>
      )}
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
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-[200px] p-4 space-y-3"
      >
        {loadingMore && allFetchedPrevious.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">Loading previous messages...</p>
        )}
        {hasMorePrevious && !loadingMore && (
          <p className="text-sm text-gray-500 text-center py-1.5">Scroll up for older messages</p>
        )}
        {!loadingMore && !hasPrevious && (
          <p className="text-sm text-gray-500 text-center py-2">No previous messages</p>
        )}
        {previousMessages.map((m, i) => renderMessage(m, `prev-${i}`))}
        {sessionMessages.map((m, i) => renderMessage(m, `session-${i}`))}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        <div ref={messagesEndRef} />
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
