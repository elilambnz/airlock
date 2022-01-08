import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

import Account from './pages/Account'
import Home from './pages/Home'
import Buy from './pages/Buy'
import Loans from './pages/Loans'
import Systems from './pages/Systems'
import Trade from './pages/Trade'
import Structures from './pages/Structures'

function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/account">Account</Link>
          </li>
          <li>
            <Link to="/buy">Buy</Link>
          </li>
          <li>
            <Link to="/loans">Loans</Link>
          </li>
          <li>
            <Link to="/systems">Systems</Link>
          </li>
          <li>
            <Link to="/trade">Trade</Link>
          </li>
          <li>
            <Link to="/structures">Structures</Link>
          </li>
        </ul>

        <hr />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/systems" element={<Systems />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/structures" element={<Structures />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
