import type { LabelHTMLAttributes } from 'react'

export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={`text-sm font-medium text-text-h mt-2.5 first:mt-0 ${className}`}
    />
  )
}
