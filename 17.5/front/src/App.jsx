import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Inicio from './pages/Inicio'
import Categorias from './pages/Categorias'
import Productos from './pages/Productos'
import { Usuarios } from './pages/Usuarios'

const App = () => {
  const [darkMode, setDarkMode] = useState('dark')

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.body.setAttribute('data-bs-theme', !darkMode ? 'dark' : 'light')
  }
  return (
    <BrowserRouter>
      <div className="app">
         <Header darkMode={darkMode} toggleTheme={toggleTheme} />
            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/categorias" element={<Categorias />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="*" element={<Inicio />} />
            </Routes>
        <Footer/>
      </div>
    </BrowserRouter>
  )
}

export default App