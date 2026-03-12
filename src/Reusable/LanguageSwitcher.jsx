import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const currentLanguage = String(i18n.resolvedLanguage || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en'
  const languageOptions = [
    { code: 'en', short: 'EN', label: 'English' },
    { code: 'ar', short: 'AR', label: 'Arabic' },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (langCode) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full border bg-white text-gray-900 text-xs font-semibold flex items-center justify-center shadow-sm"
        aria-label={t('language')}
        aria-expanded={isOpen}
      >
        {currentLanguage.toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg border bg-white shadow-lg z-50 overflow-hidden">
          {languageOptions.map((option) => {
            const isActive = currentLanguage === option.code
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => handleChange(option.code)}
                className={`w-full px-3 py-2 text-left text-sm ${isActive ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {option.short} - {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
