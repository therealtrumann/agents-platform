import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import AgentsList from './pages/AgentsList'
import AgentDetail from './pages/AgentDetail'
import Conversations from './pages/Conversations'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">🤖 Agentes WhatsApp</div>
          <div className="nav-links">
            <Link to="/">Agentes</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<AgentsList />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/agents/:id/conversations" element={<Conversations />} />
          <Route path="/agents/:id/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
