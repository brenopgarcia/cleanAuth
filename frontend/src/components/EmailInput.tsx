import type { InputHTMLAttributes } from 'react'

export function EmailInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative block w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text opacity-50 flex items-center justify-center pointer-events-none">
        <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
          <path d="m2 4 10 8 10-8" />
        </svg>
      </div>
      <input
        {...props}
        type="email"
        className={`${props.className || ''} w-full box-border pl-10`}
      />
    </div>
  )
}
