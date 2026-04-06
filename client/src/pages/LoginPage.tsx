import { useMutation } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authUserFromSession, loginRequestSchema, safeParseAuthSessionResponse } from '../schemas/login'
import { Logo } from '../components/Logo'
import { PasswordInput } from '../components/PasswordInput'
import { EmailInput } from '../components/EmailInput'
import { Card } from '../components/Card'
import { Label } from '../components/Label'
import api from '../lib/api'
import { getErrorMessage } from '../lib/error-utils'

export function LoginPage() {
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<unknown>('/auth/login', { email, password })
      const parsed = safeParseAuthSessionResponse(data)
      if (!parsed.success) {
        throw parsed.error
      }
      return authUserFromSession(parsed.data)
    },
    onSuccess: (user) => {
      setUser(user)
    },
  })

  const { isPending, error } = mutation
  const errorMessage = error ? getErrorMessage(error, 'Anmeldung fehlgeschlagen.') : null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const parsed = loginRequestSchema.safeParse({ email, password })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setFieldErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
      })
      return
    }

    mutation.mutate()
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 box-border">
      <Card className="w-full max-w-[400px] text-left">
        <div className="flex justify-center mb-8">
          <Logo height={60} />
        </div>
        <h1 className="text-[28px] -tracking-[0.5px] m-0 mb-2 font-heading">Anmelden</h1>
        <p className="m-0 mb-6 text-[15px] text-text">Verwenden Sie Ihre Zugangsdaten.</p>

        <form className="flex flex-col gap-1.5" onSubmit={handleSubmit}>
          <Label htmlFor="email">
            E-Mail
          </Label>
          <EmailInput
            id="email"
            name="email"
            autoComplete="email"
            className="font-inherit p-2.5 px-3 rounded-lg border border-border bg-bg text-text-h transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-bg)] disabled:opacity-65 disabled:cursor-not-allowed"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email ? (
            <p id="email-error" className="m-1 mb-0 mt-1 text-[13px] text-error-text" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}

          <Label htmlFor="password">
            Passwort
          </Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            className="font-inherit p-2.5 px-3 rounded-lg border border-border bg-bg text-text-h transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-bg)] disabled:opacity-65 disabled:cursor-not-allowed"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={
              fieldErrors.password ? 'password-error' : undefined
            }
          />
          {fieldErrors.password ? (
            <p id="password-error" className="m-1 mb-0 mt-1 text-[13px] text-error-text" role="alert">
              {fieldErrors.password}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-3 p-2.5 px-3 rounded-lg text-sm text-error-text bg-error-bg border border-error-border" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button type="submit" className="mt-5 font-inherit font-medium p-3 px-4 rounded-lg border-2 cursor-pointer text-text-h bg-accent-bg border-accent-border transition-[box-shadow,transform] duration-200 hover:enabled:shadow-custom active:enabled:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed" disabled={isPending}>
            {isPending ? 'Anmeldung…' : 'Anmelden'}
          </button>
        </form>

        <p className="mt-[22px] text-[15px] text-text text-center">
          Noch kein Konto? <Link to="/register" className="text-accent font-medium no-underline hover:underline">Konto erstellen</Link>
        </p>
      </Card>
    </div>
  )
}

