import { useState, type InputHTMLAttributes } from 'react'

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative block w-full">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`${props.className || ''} w-full box-border pr-10`}
      />
      <button
        type="button"
        title={show ? "Passwort verbergen" : "Passwort anzeigen"}
        className="absolute right-3 mx-auto top-1/2 -translate-y-1/2 text-text opacity-70 hover:opacity-100 transition-[opacity,color] cursor-pointer flex items-center justify-center p-1 rounded-sm focus-visible:outline-2 focus-visible:outline-accent"
        onClick={() => setShow(!show)}
      >
        {show ? (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
          </svg>
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
