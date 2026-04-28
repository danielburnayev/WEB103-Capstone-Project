import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import SharedCalendarPage from './pages/SharedCalendarPage.jsx'
import JoinCalendarPage from './pages/JoinCalendarPage.jsx'
import ProfileSetupPage from './pages/ProfileSetupPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/calendar/:code" element={<SharedCalendarPage />} />
        <Route path="/join" element={<JoinCalendarPage />} />
        <Route path="/join/profile" element={<ProfileSetupPage />} />
        <Route path="/profile" element={<ProfileSetupPage />} />
        {/* Add new routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
