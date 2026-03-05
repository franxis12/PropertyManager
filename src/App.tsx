import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './routes/Home'
import Login from './routes/Login'
import CreatePropertyTest from './routes/CreatePropertyTest'
import OwnerDashboard from './routes/OwnerDashboard'
import TenantRegister from './routes/TenantRegister'
import TenantLogin from './routes/TenantLogin'
import TenantPortal from './routes/TenantPortal'
import Info from './routes/Info'
import { RequireAuth } from './components/RequireAuth'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tenant/register" element={<TenantRegister />} />
        <Route path="/tenant/login" element={<TenantLogin />} />
        <Route path="/info" element={<Info />} />

        <Route
          path="/owner/dashboard"
          element={
            <RequireAuth role="owner">
              <OwnerDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/tenant/portal"
          element={
            <RequireAuth role="tenant">
              <TenantPortal />
            </RequireAuth>
          }
        />

        <Route path="/test/create-property" element={<CreatePropertyTest />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
