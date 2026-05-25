// src/components/LoginPage.jsx
import React from 'react'

export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
         style={{ background: 'var(--bg-primary)' }}>

      {/* Background texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
           }} />

      <div className="relative animate-fade-in" style={{ maxWidth: 420, width: '100%', padding: '0 24px' }}>

        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'var(--text-primary)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 3h8l4 4v10H4V3z" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 3v4h4" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 9h6M7 12h4" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7.5" cy="9" r="1" fill="#f5c842"/>
              </svg>
            </div>
            <span className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Lora, serif', color: 'var(--text-primary)' }}>
              Inkspace
            </span>
          </div>

          <h1 className="text-3xl font-medium mb-3" style={{ fontFamily: 'Lora, serif', color: 'var(--text-primary)', lineHeight: 1.25 }}>
            Thinking on top<br />of documents.
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            A minimal workspace for reading, annotating,<br />and organizing your PDFs.
          </p>
        </div>

        {/* Sign-in card */}
        <div className="rounded-2xl p-8 border animate-slide-up"
             style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-md)' }}>

          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Your documents are private and only accessible by you.
          </p>
        </div>

        {/* Feature hints */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: '✦', label: 'Highlight & underline' },
            { icon: '◎', label: 'Notes & bookmarks' },
            { icon: '◈', label: 'Light, dark & sepia' },
          ].map((f) => (
            <div key={f.label} className="text-center">
              <div className="text-lg mb-1" style={{ color: 'var(--text-muted)' }}>{f.icon}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
