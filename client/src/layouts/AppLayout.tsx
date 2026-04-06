import { NavLink, Outlet } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import './AppLayout.css'

const SIDEBAR_COLLAPSED_KEY = 'app-sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function DashboardIcon() {
  return (
    <svg
      className="app-nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg
      className="app-nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      className="app-nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      className="app-sidebar-toggle-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      className="app-sidebar-toggle-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function AppLayout() {
  const logout = useAuthStore((s) => s.logout)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      writeCollapsed(next)
      return next
    })
  }, [])

  return (
    <div
      className={
        'app-area' + (collapsed ? ' app-area--sidebar-collapsed' : '')
      }
    >
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="app-sidebar-header">
          <div className="app-brand" aria-label="CleanAuth">
            <span className="app-brand-full">CleanAuth</span>
            <span className="app-brand-short" aria-hidden>
              C
            </span>
          </div>
          <button
            type="button"
            className="app-sidebar-toggle"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar-nav"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <nav id="app-sidebar-nav" className="app-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              'app-nav-link' + (isActive ? ' active' : '')
            }
            title="Dashboard"
          >
            <DashboardIcon />
            <span className="app-nav-label">Dashboard</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              'app-nav-link' + (isActive ? ' active' : '')
            }
            title="Profile"
          >
            <ProfileIcon />
            <span className="app-nav-label">Profile</span>
          </NavLink>
        </nav>
        <button
          type="button"
          className="app-sidebar-logout"
          onClick={() => logout()}
          title="Sign out"
        >
          <LogoutIcon />
          <span className="app-nav-label">Sign out</span>
        </button>
      </aside>
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  )
}
