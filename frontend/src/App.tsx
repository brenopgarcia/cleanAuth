import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import { ThemeToggle } from './components/ThemeToggle'
import { AppLayout } from './layouts/AppLayout'
import { useAuthStore } from './store/authStore'
import { DashboardPage } from './pages/DashboardPage'
import { BillingStockPage } from './pages/BillingStockPage'
import { ForecastNotInvoicedPage } from './pages/ForecastNotInvoicedPage'
import { ForecastNotInvoicedNextMonthPage } from './pages/ForecastNotInvoicedNextMonthPage'
import { InventoryPage } from './pages/InventoryPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminPage } from './pages/AdminPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { useAccess } from './hooks/useAccess'

function AdminRoute({ children }: { children: ReactElement }) {
  const { isAdmin } = useAccess()
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const user = useAuthStore((s) => s.user)
  const { isAdmin } = useAccess()

  return (
    <>
      <ThemeToggle />
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="bestand" element={<InventoryPage />} />
            <Route path="fakturierter-bestand" element={<BillingStockPage />} />
            <Route path="forecast-nicht-fakturiert" element={<ForecastNotInvoicedPage />} />
            <Route path="forecast-nicht-fakturiert-naechster-monat" element={<ForecastNotInvoicedNextMonthPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="admin"
              element={(
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              )}
            />
            <Route
              path="admin-login"
              element={isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  )
}

export default App
