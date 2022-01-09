import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Account from './pages/Account'
import Marketplace from './pages/Marketplace'
import Systems from './pages/Systems'
import Structures from './pages/Structures'
import Loans from './pages/Loans'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/systems" element={<Systems />} />
          <Route path="/structures" element={<Structures />} />
          <Route path="/loans" element={<Loans />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
