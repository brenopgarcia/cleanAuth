import { NavLink, Outlet } from 'react-router-dom'
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

const SIDEBAR_COLLAPSED_KEY = 'app-sidebar-collapsed'

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
            to="/bestand"
            className={({ isActive }) =>
              `flex items-center gap-2.5 p-2.5 px-3 rounded-lg text-[15px] font-medium text-text no-underline transition-[background,color] duration-150 relative
               hover:text-text-h hover:bg-accent-bg
               ${isActive ? 'text-text-h bg-accent-bg border border-accent-border p-[9px] px-[11px]' : ''}
               ${collapsed ? 'justify-center max-md:justify-start' : ''}`
            }
            title="Bestand"
          >
            <InventoryIcon />
            <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Bestand</span>
          </NavLink>
          <NavLink
            to="/fakturierter-bestand"
            className={({ isActive }) =>
              `flex items-center gap-2.5 p-2.5 px-3 rounded-lg text-[15px] font-medium text-text no-underline transition-[background,color] duration-150 relative
               hover:text-text-h hover:bg-accent-bg
               ${isActive ? 'text-text-h bg-accent-bg border border-accent-border p-[9px] px-[11px]' : ''}
               ${collapsed ? 'justify-center max-md:justify-start' : ''}`
            }
            title="Fakturierter Bestand"
          >
            <BillingStockIcon />
            <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Fakt. Bestand</span>
          </NavLink>
          <NavLink
            to="/forecast-nicht-fakturiert"
            className={({ isActive }) =>
              `flex items-center gap-2.5 p-2.5 px-3 rounded-lg text-[15px] font-medium text-text no-underline transition-[background,color] duration-150 relative
               hover:text-text-h hover:bg-accent-bg
               ${isActive ? 'text-text-h bg-accent-bg border border-accent-border p-[9px] px-[11px]' : ''}
               ${collapsed ? 'justify-center max-md:justify-start' : ''}`
            }
            title="Forecast"
          >
            <ForecastIcon />
            <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Forecast</span>
          </NavLink>
          <NavLink
            to="/forecast-nicht-fakturiert-naechster-monat"
            className={({ isActive }) =>
              `flex items-center gap-2.5 p-2.5 px-3 rounded-lg text-[15px] font-medium text-text no-underline transition-[background,color] duration-150 relative
               hover:text-text-h hover:bg-accent-bg
               ${isActive ? 'text-text-h bg-accent-bg border border-accent-border p-[9px] px-[11px]' : ''}
               ${collapsed ? 'justify-center max-md:justify-start' : ''}`
            }
            title="Forecast nächster Monat"
          >
            <ForecastIcon />
            <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Forecast N+1</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2.5 p-2.5 px-3 rounded-lg text-[15px] font-medium text-text no-underline transition-[background,color] duration-150 relative
               hover:text-text-h hover:bg-accent-bg
               ${isActive ? 'text-text-h bg-accent-bg border border-accent-border p-[9px] px-[11px]' : ''}
               ${collapsed ? 'justify-center max-md:justify-start' : ''}`
            }
            title="Profil"
          >
            <ProfileIcon />
            <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Profil</span>
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
          title="Abmelden"
        >
          <LogoutIcon />
          <span className={`transition-opacity duration-150 ${collapsed ? 'sr-only max-md:not-sr-only' : 'block'}`}>Abmelden</span>
        </button>
      </aside>
      <div className="flex-1 min-w-0 p-7 px-8 pb-10 box-border overflow-y-auto max-md:p-5 max-md:px-4 max-md:pb-8">
        <Outlet />
      </div>
    </div>
  )
}

