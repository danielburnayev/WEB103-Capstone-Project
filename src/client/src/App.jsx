import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import SharedCalendarPage from './pages/SharedCalendarPage.jsx'
import JoinCalendarPage from './pages/JoinCalendarPage.jsx'
import ProfileSetupPage from './pages/ProfileSetupPage.jsx'
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calendar/:code" element={<SharedCalendarPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/join" element={<JoinCalendarPage />} />
        <Route path="/join/profile" element={<ProfileSetupPage />} />
        {/* Add new routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
