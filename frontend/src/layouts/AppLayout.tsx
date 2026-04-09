import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Logo } from '../components/Logo'
import { DashboardIcon } from '../components/DashboardIcon'
import { ForecastIcon } from '../components/ForecastIcon'
import { BillingStockIcon } from '../components/BillingStockIcon'
import { InventoryIcon } from '../components/InventoryIcon'
import { ProfileIcon } from '../components/ProfileIcon'
import { LogoutIcon } from '../components/LogoutIcon'
import { ChevronLeftIcon } from '../components/ChevronLeftIcon'
import { ChevronRightIcon } from '../components/ChevronRightIcon'
import { useAccess } from '../hooks/useAccess'

const SIDEBAR_COLLAPSED_KEY = 'app-sidebar-collapsed'
const NAV_ITEMS = [
  { to: '/', pageTitle: 'Dashboard', navLabel: 'Dashboard', icon: DashboardIcon },
  { to: '/bestand', pageTitle: 'Bestand', navLabel: 'Bestand', icon: InventoryIcon },
  { to: '/fakturierter-bestand', pageTitle: 'Fakturierter Bestand', navLabel: 'Fakt. Bestand', icon: BillingStockIcon },
  { to: '/forecast-nicht-fakturiert', pageTitle: 'Forecast', navLabel: 'Forecast', icon: ForecastIcon },
  { to: '/forecast-nicht-fakturiert-naechster-monat', pageTitle: 'Forecast N + 1', navLabel: 'Forecast N + 1', icon: ForecastIcon },
  { to: '/profile', pageTitle: 'Profil', navLabel: 'Profil', icon: ProfileIcon },
  // Admin area (visible only for global admins)
  { to: '/admin', pageTitle: 'Admin', navLabel: 'Admin', icon: ProfileIcon },
] as const

const readCollapsed = (): boolean => {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

const writeCollapsed = (value: boolean) => {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}


export function AppLayout() {
  const logout = useAuthStore((s) => s.logout)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const user = useAuthStore((s) => s.user)
  const { isAdmin } = useAccess()
  const location = useLocation()
  const { pathname } = location
  const locationState = location.state as { title?: string } | null

  const currentPageTitle =
    locationState?.title ??
    NAV_ITEMS.find((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)))?.pageTitle ??
    'Dashboard'

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      writeCollapsed(next)
      return next
    })
  }, [])

  return (
    <div className="flex h-svh w-full text-left box-border overflow-hidden max-md:flex-col">
      <aside
        className={`
          flex flex-col gap-5 p-6 border-r border-border bg-bg max-h-svh overflow-y-auto transition-[flex-basis,width,padding] duration-220 ease
          max-md:flex-none max-md:w-full! max-md:flex-row max-md:flex-wrap max-md:items-center max-md:gap-3 max-md:border-r-0 max-md:border-b max-md:p-4
          ${collapsed ? 'basis-[72px] w-[18] p-5 px-3 items-stretch max-md:w-full!' : 'basis-[260px] w-[260px]'}
        `}
        aria-label="Hauptnavigation"
      >
        <div className={`flex items-center justify-between gap-1 min-h-[32px] max-md:basis-full max-md:min-w-0 ${collapsed ? 'flex-col items-center gap-4' : ''}`}>
          <Logo collapsed={collapsed} height={36} className={collapsed ? 'w-full' : ''} />
          <button
            type="button"
            className={`shrink-0 flex items-center justify-center w-9 h-9 p-0 border border-border rounded-lg bg-bg text-text-h cursor-pointer transition-[border-color,background,box-shadow] duration-200 hover:border-accent-border hover:bg-accent-bg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 max-md:hidden`}
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar-nav"
            title={collapsed ? 'Ausklappen' : 'Einklappen'}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <nav id="app-sidebar-nav" className="flex flex-col gap-1 max-md:flex-row max-md:flex-wrap max-md:flex-1">
          {NAV_ITEMS.filter((item) => (item.to.startsWith('/admin') ? isAdmin : true)).map(({ to, pageTitle, navLabel, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              state={{ title: pageTitle }}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 p-2.5 px-3 rounded-lg text-[15px] font-medium text-text no-underline transition-[background,color] duration-150 relative
                 hover:text-text-h hover:bg-accent-bg
                 ${isActive ? 'text-text-h bg-accent-bg border border-accent-border p-[9px] px-[11px]' : ''}
                 ${collapsed ? 'justify-center max-md:justify-start' : ''}`
              }
              title={pageTitle}
            >
              <Icon />
              <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>{navLabel}</span>
            </NavLink>
          ))}
        </nav>
        <div className={`mt-auto flex flex-col items-center justify-start gap-2.5 font-inherit font-medium p-2.5 px-3.5 rounded-lg cursor-pointer text-text-h bg-transparent
           
            max-md:mt-0
            ${collapsed ? 'justify-center p-2.5 px-2.5' : ''}`}>
          <span className={`text-sm text-text-h font-medium ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>{user?.email}</span>
          <button
            type="button"
            className={`
            flex items-center justify-start gap-2.5 font-inherit font-medium p-2.5 px-3.5 rounded-lg cursor-pointer text-text-h bg-transparent border border-border transition-[border-color,box-shadow] duration-200
            hover:border-accent-border hover:shadow-custom
            ${collapsed ? 'justify-center p-2.5 px-2.5' : ''}
          `}
            onClick={() => logout()}
            title="Abmelden"
          >
            <LogoutIcon />
            <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Abmelden</span>
          </button>
        </div>
      </aside >
      <div className="flex-1 min-w-0 p-7 px-8 pb-10 box-border overflow-y-auto max-md:p-5 max-md:px-4 max-md:pb-8">
        <h2 className="m-0 mb-4 text-2xl font-semibold text-text-h">{currentPageTitle}</h2>
        <Outlet />
      </div>
    </div >
  )
}

