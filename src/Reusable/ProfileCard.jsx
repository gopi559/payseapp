import React from 'react'

const ProfileCard = ({ icon: Icon, title, children, className = '' }) => {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {Icon ? <Icon size={18} /> : null}
        </div>
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
      </header>
      <div className="px-5 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  )
}

export default ProfileCard
