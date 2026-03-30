// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login'; 
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Navbar /> 
        <main className="container mx-auto px-4 py-6">
          <Routes>
            {/* Swap the hidden text for the actual Home component */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;