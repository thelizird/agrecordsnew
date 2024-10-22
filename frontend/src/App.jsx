import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
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
        <Route
          path="/"
          element={
              <Home />
          }
        />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>}/>
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>}/>

        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>}/>
        <Route path="/testingdata" element={<ProtectedRoute><TestingData /></ProtectedRoute>}/>

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
