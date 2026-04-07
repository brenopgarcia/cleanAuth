import { useMutation } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { safeParseRegisterResponse } from '../schemas/register'
import { registerFormSchema } from '../schemas/register'
import { authUserFromSession } from '../schemas/login'
import { useAuthStore } from '../store/authStore'
import { Logo } from '../components/Logo'
import { PasswordInput } from '../components/PasswordInput'
import { EmailInput } from '../components/EmailInput'
import { Card } from '../components/Card'
import { Label } from '../components/Label'
import api from '../lib/api'
import { getErrorMessage } from '../lib/error-utils'

export function RegisterPage() {
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    userName?: string
  }>({})

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = { email, password }
      if (userName.trim()) {
        payload.userName = userName.trim()
      }

      const { data } = await api.post<unknown>('/auth/register', payload)
      const parsed = safeParseRegisterResponse(data)
      if (!parsed.success) {
        throw parsed.error
      }

      let user = authUserFromSession(parsed.data)
      if (userName.trim()) {
        user = { ...user, name: userName.trim() }
      }
      return user
    },
    onSuccess: (user) => {
      setUser(user)
    },
  })

  const { isPending, error } = mutation
  const errorMessage = error ? getErrorMessage(error, 'Registrierung fehlgeschlagen.') : null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const parsed = registerFormSchema.safeParse({
      email,
      password,
      confirmPassword,
      userName: userName.trim() || undefined,
    })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setFieldErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
        userName: flat.userName?.[0],
      })
      return
    }

    mutation.mutate()
  }

  const inputClass = "font-inherit p-2.5 px-3 rounded-lg border border-border bg-bg text-text-h transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-bg)] disabled:opacity-65 disabled:cursor-not-allowed"
  const errorTextClass = "m-1 mb-0 mt-1 text-[13px] text-error-text"

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 box-border">
      <Card className="w-full max-w-[400px] text-left">
        <div className="flex justify-center mb-8">
          <Logo height={60} />
        </div>
        <h1 className="text-[28px] -tracking-[0.5px] m-0 mb-2 font-heading">Konto erstellen</h1>
        <p className="m-0 mb-6 text-[15px] text-text">Registrieren Sie sich mit Ihrer E-Mail und einem Passwort.</p>

        <form className="flex flex-col gap-1.5" onSubmit={handleSubmit}>
          <Label htmlFor="register-email">
            E-Mail
          </Label>
          <EmailInput
            id="register-email"
            name="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={
              fieldErrors.email ? 'register-email-error' : undefined
            }
          />
          {fieldErrors.email ? (
            <p
              id="register-email-error"
              className={errorTextClass}
              role="alert"
            >
              {fieldErrors.email}
            </p>
          ) : null}

          <Label htmlFor="register-username">
            Benutzername <span className="font-normal text-text opacity-85">(optional)</span>
          </Label>
          <input
            id="register-username"
            name="userName"
            type="text"
            autoComplete="username"
            className={inputClass}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isPending}
            aria-invalid={fieldErrors.userName ? true : undefined}
            aria-describedby={
              fieldErrors.userName ? 'register-username-error' : undefined
            }
          />
          {fieldErrors.userName ? (
            <p
              id="register-username-error"
              className={errorTextClass}
              role="alert"
            >
              {fieldErrors.userName}
            </p>
          ) : null}

          <Label htmlFor="register-password">
            Passwort
          </Label>
          <PasswordInput
            id="register-password"
            name="password"
            autoComplete="new-password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={
              fieldErrors.password ? 'register-password-error' : undefined
            }
          />
          {fieldErrors.password ? (
            <p
              id="register-password-error"
              className={errorTextClass}
              role="alert"
            >
              {fieldErrors.password}
            </p>
          ) : null}

          <Label htmlFor="register-confirm">
            Passwort bestätigen
          </Label>
          <PasswordInput
            id="register-confirm"
            name="confirmPassword"
            autoComplete="new-password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            aria-invalid={fieldErrors.confirmPassword ? true : undefined}
            aria-describedby={
              fieldErrors.confirmPassword ? 'register-confirm-error' : undefined
            }
          />
          {fieldErrors.confirmPassword ? (
            <p
              id="register-confirm-error"
              className={errorTextClass}
              role="alert"
            >
              {fieldErrors.confirmPassword}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-3 p-2.5 px-3 rounded-lg text-sm text-error-text bg-error-bg border border-error-border" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button type="submit" className="mt-5 font-inherit font-medium p-3 px-4 rounded-lg border-2 cursor-pointer text-text-h bg-accent-bg border-accent-border transition-[box-shadow,transform] duration-200 hover:enabled:shadow-custom active:enabled:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed" disabled={isPending}>
            {isPending ? 'Konto wird erstellt…' : 'Konto erstellen'}
          </button>
        </form>

        <p className="mt-[22px] text-[15px] text-text text-center">
          Haben Sie bereits ein Konto?{' '}
          <Link to="/login" className="text-accent font-medium no-underline hover:underline">Anmelden</Link>
        </p>
      </Card>
    </div>
  )
}
