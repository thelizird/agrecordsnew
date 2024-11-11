import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleBasedRoute from "./components/RoleBasedRoute"
import Analytics from "./pages/Analytics"
import Clients from "./pages/Clients"
import TestingData from "./pages/TestingData"
import Reports from "./pages/Reports"

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Available to all authenticated users */}
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Company only */}
        <Route 
          path="/reports" 
          element={
            <RoleBasedRoute allowedRoles={['COMPANY']}>
              <Reports />
            </RoleBasedRoute>
          }
        />

        {/* Agronomist and Company */}
        <Route 
          path="/clients" 
          element={
            <RoleBasedRoute allowedRoles={['AGRONOMIST', 'COMPANY']}>
              <Clients />
            </RoleBasedRoute>
          }
        />

        {/* Agronomist and Company */}
        <Route 
          path="/testingdata" 
          element={
            <RoleBasedRoute allowedRoles={['AGRONOMIST', 'COMPANY']}>
              <TestingData />
            </RoleBasedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
