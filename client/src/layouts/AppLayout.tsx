import { NavLink, Outlet } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useAuthStore } from '../store/authStore'

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
      className="w-5 h-5 shrink-0"
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
      className="w-5 h-5 shrink-0"
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
      className="w-5 h-5 shrink-0"
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
      className="w-4.5 h-4.5"
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
      className="w-4.5 h-4.5"
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
    <div className="flex min-h-svh w-full text-left box-border max-md:flex-col">
      <aside 
        className={`
          flex flex-col gap-5 p-6 border-r border-border bg-bg transition-[flex-basis,width,padding] duration-220 ease
          max-md:flex-none max-md:w-full! max-md:flex-row max-md:flex-wrap max-md:items-center max-md:gap-3 max-md:border-r-0 max-md:border-b max-md:p-4
          ${collapsed ? 'basis-[72px] w-[18] p-5 px-3 items-stretch max-md:w-full!' : 'basis-[220px] w-[220px]'}
        `} 
        aria-label="Main navigation"
      >
        <div className={`flex items-center justify-between gap-2 min-h-[28px] max-md:basis-full max-md:min-w-0 ${collapsed ? 'flex-col max-md:flex-row items-center gap-3' : ''}`}>
          <div className="relative min-w-0 flex-1 font-heading text-lg font-semibold text-text-h -tracking-[0.02em]" aria-label="CleanAuth">
            <span className={`block whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-150 ${collapsed ? 'hidden max-md:block' : 'block'}`}>CleanAuth</span>
            <span className={`hidden text-center text-xl transition-opacity duration-150 ${collapsed ? 'block max-md:hidden' : 'hidden'}`} aria-hidden>
              C
            </span>
          </div>
          <button
            type="button"
            className="shrink-0 flex items-center justify-center w-9 h-9 p-0 border border-border rounded-lg bg-bg text-text-h cursor-pointer transition-[border-color,background,box-shadow] duration-200 hover:border-accent-border hover:bg-accent-bg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 max-md:hidden"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar-nav"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <nav id="app-sidebar-nav" className="flex flex-col gap-1 max-md:flex-row max-md:flex-wrap max-md:flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 p-2.5 px-3 rounded-lg text-[15px] font-medium text-text no-underline transition-[background,color] duration-150 relative
               hover:text-text-h hover:bg-accent-bg
               ${isActive ? 'text-text-h bg-accent-bg border border-accent-border p-[9px] px-[11px]' : ''}
               ${collapsed ? 'justify-center max-md:justify-start' : ''}`
            }
            title="Dashboard"
          >
            <DashboardIcon />
            <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Dashboard</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2.5 p-2.5 px-3 rounded-lg text-[15px] font-medium text-text no-underline transition-[background,color] duration-150 relative
               hover:text-text-h hover:bg-accent-bg
               ${isActive ? 'text-text-h bg-accent-bg border border-accent-border p-[9px] px-[11px]' : ''}
               ${collapsed ? 'justify-center max-md:justify-start' : ''}`
            }
            title="Profile"
          >
            <ProfileIcon />
            <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Profile</span>
          </NavLink>
        </nav>
        <button
          type="button"
          className={`
            mt-auto flex items-center justify-start gap-2.5 font-inherit font-medium p-2.5 px-3.5 rounded-lg cursor-pointer text-text-h bg-transparent border border-border transition-[border-color,box-shadow] duration-200
            hover:border-accent-border hover:shadow-custom
            max-md:mt-0
            ${collapsed ? 'justify-center p-2.5 px-2.5' : ''}
          `}
          onClick={() => logout()}
          title="Sign out"
        >
          <LogoutIcon />
          <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Sign out</span>
        </button>
      </aside>
      <div className="flex-1 min-w-0 p-7 px-8 pb-10 box-border max-md:p-5 max-md:px-4 max-md:pb-8">
        <Outlet />
      </div>
    </div>
  )
}

