import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TripPlanner from './trip-planner'
import GuestEventPage from './components/GuestEventPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/event/:eventId" element={<GuestEventPage />} />
        <Route path="/" element={<TripPlanner />} />
        <Route path="/:section" element={<TripPlanner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
