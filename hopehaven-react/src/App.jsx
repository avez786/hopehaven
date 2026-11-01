import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Children from './Children';
import Login from './Login';
import Register from './Register';
import Donate from './Donate';
import Admin from './Admin';
import './App.css';

function currentUser() {
  for (const key of ['user', 'currentUser', 'loggedInUser']) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      if (value && typeof value === 'object') return value;
    } catch { /* try next key */ }
  }
  return null;
}

function Navbar() {
  const location = useLocation();
  const [revision, setRevision] = useState(0);
  const token = localStorage.getItem('token');
  const user = currentUser();
  const role = String(user?.role || '').replace(/^ROLE_/i, '').toUpperCase();

  function logout() {
    ['token', 'user', 'currentUser', 'loggedInUser'].forEach(key => localStorage.removeItem(key));
    setRevision(value => value + 1);
    window.location.assign('/login');
  }

  return (
    <header className="navbar" key={`${location.pathname}-${revision}`}>
      <Link to="/" className="site-brand">HopeHaven</Link>
      <nav aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/children">Children</Link>
        {role === 'DONOR' && <Link to="/donate">Donate</Link>}
        {!token && <Link to="/donate">Donate</Link>}
        {token && role === 'ADMIN' && <Link to="/admin">Admin Dashboard</Link>}
        {!token ? <Link to="/login">Login</Link> : (
          <button type="button" className="nav-logout" onClick={logout}>Log out</button>
        )}
      </nav>
    </header>
  );
}

function Home() {
  return (
    <>
      <Navbar />
      <main id="home" className="hero">
        <p className="eyebrow">EVERY CHILD DESERVES A LOVING HOME</p>
        <h1>Give a Child a Chance<br />to Shine</h1>
        <p className="description">
          Help children find loving families and support a brighter future
          through adoption, donations, and compassion.
        </p>
        <div className="actions">
          <Link to="/children" className="primary">Meet the Children</Link>
          <Link to="/donate" className="secondary">Make a Donation</Link>
        </div>
      </main>
      <section className="features">
        <article><h3>Find a Loving Home</h3><p>Explore children waiting for a family and learn about adoption.</p></article>
        <article><h3>Make a Difference</h3><p>Your support helps provide care, education, and opportunities.</p></article>
        <article><h3>Build a Brighter Future</h3><p>Every act of kindness can create meaningful change.</p></article>
      </section>
      <footer><p>© 2026 HopeHaven. Every child deserves hope.</p></footer>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/children" element={<Children />} />
        <Route path="/donate" element={<><Navbar /><Donate /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
