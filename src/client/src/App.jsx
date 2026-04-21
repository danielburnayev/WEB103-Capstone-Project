import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import SharedCalendarPage from './pages/SharedCalendarPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calendar/:code" element={<SharedCalendarPage />} />
        {/* Add new routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
