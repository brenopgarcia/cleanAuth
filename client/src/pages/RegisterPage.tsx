import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { registerFormSchema } from '../schemas/register'
import { useAuthStore } from '../store/authStore'
import { Logo } from '../components/Logo'

export function RegisterPage() {
  const register = useAuthStore((s) => s.register)
  const clearError = useAuthStore((s) => s.clearError)
  const error = useAuthStore((s) => s.error)
  const isLoading = useAuthStore((s) => s.isLoading)

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearError()
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

    try {
      await register(
        parsed.data.email,
        parsed.data.password,
        parsed.data.userName,
      )
    } catch {
      /* error surfaced via store */
    }
  }

  const inputClass = "font-inherit p-2.5 px-3 rounded-lg border border-border bg-bg text-text-h transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-bg)] disabled:opacity-65 disabled:cursor-not-allowed"
  const labelClass = "text-sm font-medium text-text-h mt-2.5 first:mt-0"
  const errorTextClass = "m-1 mb-0 mt-1 text-[13px] text-error-text"

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 box-border">
      <div className="w-full max-w-[400px] p-8 px-7 rounded-xl border border-border bg-bg shadow-custom text-left">
        <Logo height={48} className="mb-8" />
        <h1 className="text-[28px] -tracking-[0.5px] m-0 mb-2 font-heading">Konto erstellen</h1>
        <p className="m-0 mb-6 text-[15px] text-text">Registrieren Sie sich mit Ihrer E-Mail und einem Passwort.</p>

        <form className="flex flex-col gap-1.5" onSubmit={handleSubmit}>
          <label className={labelClass} htmlFor="register-email">
            E-Mail
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
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

          <label className={labelClass} htmlFor="register-username">
            Benutzername <span className="font-normal text-text opacity-85">(optional)</span>
          </label>
          <input
            id="register-username"
            name="userName"
            type="text"
            autoComplete="username"
            className={inputClass}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isLoading}
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

          <label className={labelClass} htmlFor="register-password">
            Passwort
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
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

          <label className={labelClass} htmlFor="register-confirm">
            Passwort bestätigen
          </label>
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
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

          {error ? (
            <p className="mt-3 p-2.5 px-3 rounded-lg text-sm text-error-text bg-error-bg border border-error-border" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="mt-5 font-inherit font-medium p-3 px-4 rounded-lg border-2 cursor-pointer text-text-h bg-accent-bg border-accent-border transition-[box-shadow,transform] duration-200 hover:enabled:shadow-custom active:enabled:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed" disabled={isLoading}>
            {isLoading ? 'Konto wird erstellt…' : 'Konto erstellen'}
          </button>
        </form>

        <p className="mt-[22px] text-[15px] text-text text-center">
          Haben Sie bereits ein Konto?{' '}
          <Link to="/login" className="text-accent font-medium no-underline hover:underline">Anmelden</Link>
        </p>
      </div>
    </div>
  )
}
