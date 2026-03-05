import React, { useState } from 'react'
import { HiChatBubbleLeftRight } from 'react-icons/hi2'
import ChatBotPanel from './ChatBotPanel'
import THEME_COLORS from '../../theme/colors'

const ChatBotButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const mainColor = THEME_COLORS.header.background
  const hoverColor = THEME_COLORS.sidebar.logoutHoverBackground

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full text-white shadow-lg transition-colors flex items-center justify-center"
        style={{ backgroundColor: isHovered ? hoverColor : mainColor }}
        aria-label="Open chatbot"
      >
        <HiChatBubbleLeftRight className="w-7 h-7" />
      </button>
      <ChatBotPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default ChatBotButton
