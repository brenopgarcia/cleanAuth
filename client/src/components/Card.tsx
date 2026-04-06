import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`p-8 px-7 rounded-xl border border-border bg-bg shadow-custom ${className}`}
    />
  )
}
