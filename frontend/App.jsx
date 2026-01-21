// ===== FRONTEND: App.jsx =====
// Copy this into: frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import ResidentialDrainage from './pages/ResidentialDrainage';
import CommercialDrainage from './pages/CommercialDrainage';
import ResidentialPlumbing from './pages/ResidentialPlumbing';
import CommercialPlumbing from './pages/CommercialPlumbing';
import CCTVAssessment from './pages/CCTVAssessment';
import AdminPortal from './pages/AdminPortal';
import './styles/App.css';

function App() {
  const [apiStatus, setApiStatus] = useState(false);

  useEffect(() => {
    // Check if backend is running
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(true))
      .catch(() => setApiStatus(false));
  }, []);

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/residential-drainage" element={<ResidentialDrainage />} />
            <Route path="/commercial-drainage" element={<CommercialDrainage />} />
            <Route path="/residential-plumbing" element={<ResidentialPlumbing />} />
            <Route path="/commercial-plumbing" element={<CommercialPlumbing />} />
            <Route path="/cctv-assessment" element={<CCTVAssessment />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </main>
        <Footer />
        {!apiStatus && <div className="api-warning">⚠️ Backend not connected</div>}
      </div>
    </Router>
  );
}

export default App;


// ===== FRONTEND: Navigation.jsx =====
// Copy this into: frontend/src/components/Navigation.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navigation.css';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🔧 Drainage & Plumbing
        </Link>
        
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li className="dropdown">
            <span className="nav-link">Drainage ▼</span>
            <div className="dropdown-menu">
              <Link to="/residential-drainage">Residential</Link>
              <Link to="/commercial-drainage">Commercial</Link>
            </div>
          </li>
          <li className="dropdown">
            <span className="nav-link">Plumbing ▼</span>
            <div className="dropdown-menu">
              <Link to="/residential-plumbing">Residential</Link>
              <Link to="/commercial-plumbing">Commercial</Link>
            </div>
          </li>
          <li><Link to="/cctv-assessment">CCTV Assessment</Link></li>
          <li><Link to="/admin" className="nav-link-admin">Admin</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;


// ===== FRONTEND: Footer.jsx =====
// Copy this into: frontend/src/components/Footer.jsx

import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>Professional drainage and plumbing services for residential and commercial properties.</p>
        </div>

        <div className="footer-section">
          <h3>Services</h3>
          <ul>
            <li><a href="/residential-drainage">Residential Drainage</a></li>
            <li><a href="/commercial-drainage">Commercial Drainage</a></li>
            <li><a href="/residential-plumbing">Residential Plumbing</a></li>
            <li><a href="/commercial-plumbing">Commercial Plumbing</a></li>
            <li><a href="/cctv-assessment">CCTV Assessment</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>📞 Phone: (555) 123-4567</p>
          <p>📧 Email: contact@company.com</p>
          <p>📍 Address: Your City, Your State</p>
        </div>

        <div className="footer-section">
          <h3>Hours</h3>
          <p>Mon-Fri: 8am - 6pm</p>
          <p>Sat: 9am - 5pm</p>
          <p>Sun: Closed</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Your Company Name. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;


// ===== FRONTEND: ImageCarousel.jsx =====
// Copy this into: frontend/src/components/ImageCarousel.jsx

import React, { useState, useEffect } from 'react';
import '../styles/Carousel.css';

function ImageCarousel({ images, title }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="carousel">
      <h2>{title}</h2>
      <div className="carousel-container">
        <button className="carousel-btn prev" onClick={goToPrev}>❮</button>
        <div className="carousel-slide">
          <img src={images[current]} alt={`Slide ${current + 1}`} />
        </div>
        <button className="carousel-btn next" onClick={goToNext}>❯</button>
      </div>
      <div className="carousel-dots">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;


// ===== FRONTEND: SelfAssessment.jsx =====
// Copy this into: frontend/src/components/SelfAssessment.jsx

import React, { useState } from 'react';
import '../styles/SelfAssessment.css';

function SelfAssessment({ questions, serviceType, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          answers: answers,
          service: serviceType
        })
      });

      if (response.ok) {
        setSubmitted(true);
        onSubmit && onSubmit();
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
    }
  };

  if (submitted) {
    return <div className="success-message">✅ Thank you! We'll contact you soon.</div>;
  }

  return (
    <form className="assessment-form" onSubmit={handleSubmit}>
      <h3>Quick Assessment</h3>
      
      <div className="form-group">
        <label>Name *</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name}
          onChange={handleFormChange}
          required 
        />
      </div>

      <div className="form-group">
        <label>Email *</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email}
          onChange={handleFormChange}
          required 
        />
      </div>

      <div className="form-group">
        <label>Phone *</label>
        <input 
          type="tel" 
          name="phone" 
          value={formData.phone}
          onChange={handleFormChange}
          required 
        />
      </div>

      {questions.map((q) => (
        <div key={q.id} className="question-group">
          <label>{q.text}</label>
          <div className="options">
            {q.options.map((option) => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={option}
                  checked={answers[q.id] === option}
                  onChange={() => handleAnswerChange(q.id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button type="submit" className="btn-submit">Submit Assessment</button>
    </form>
  );
}

export default SelfAssessment;
