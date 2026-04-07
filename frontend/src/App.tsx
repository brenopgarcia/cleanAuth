import { Navigate, Route, Routes } from 'react-router-dom'
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

function App() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <ThemeToggle />
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  )
}

export default App
