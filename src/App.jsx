import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Toolkit from './pages/Toolkit'
import Contact from './pages/Contact'

export default function App() {
  return (
    <div className="page-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/toolkit" element={<Toolkit />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  )
}
