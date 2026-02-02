import React, { useState } from 'react'
import { HiChatBubbleLeftRight } from 'react-icons/hi2'
import ChatBotPanel from './ChatBotPanel'

const ChatBotButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand-primary text-white shadow-lg hover:bg-brand-action transition-colors flex items-center justify-center"
        aria-label="Open chatbot"
      >
        <HiChatBubbleLeftRight className="w-7 h-7" />
      </button>
      <ChatBotPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default ChatBotButton
