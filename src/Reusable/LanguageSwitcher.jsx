import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n, t } = useTranslation()

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <label className={`flex items-center gap-2 text-sm ${className}`}>
      <span>{t('language')}</span>
      <select
        value={i18n.resolvedLanguage || 'en'}
        onChange={handleChange}
        className="rounded-md border px-2 py-1 bg-white text-slate-800"
        aria-label={t('language')}
      >
        <option value="en">{t('english')}</option>
        <option value="ar">{t('arabic')}</option>
      </select>
    </label>
  )
}

export default LanguageSwitcher
