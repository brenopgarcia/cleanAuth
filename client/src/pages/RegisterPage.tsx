import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { registerFormSchema } from '../schemas/register'
import { useAuthStore } from '../store/authStore'
import './LoginPage.css'

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

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Create account</h1>
        <p className="login-subtitle">Sign up with your email and a password.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            className="login-input"
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
              className="login-field-error"
              role="alert"
            >
              {fieldErrors.email}
            </p>
          ) : null}

          <label className="login-label" htmlFor="register-username">
            Username <span className="login-optional">(optional)</span>
          </label>
          <input
            id="register-username"
            name="userName"
            type="text"
            autoComplete="username"
            className="login-input"
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
              className="login-field-error"
              role="alert"
            >
              {fieldErrors.userName}
            </p>
          ) : null}

          <label className="login-label" htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="login-input"
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
              className="login-field-error"
              role="alert"
            >
              {fieldErrors.password}
            </p>
          ) : null}

          <label className="login-label" htmlFor="register-confirm">
            Confirm password
          </label>
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="login-input"
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
              className="login-field-error"
              role="alert"
            >
              {fieldErrors.confirmPassword}
            </p>
          ) : null}

          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="login-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
