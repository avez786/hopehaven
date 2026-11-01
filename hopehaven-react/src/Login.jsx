import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from './api';
import './Login.css';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return {}; }
}
function normalizeRole(value) {
  return String(value || '').replace(/^ROLE_/i, '').toUpperCase();
}
function getToken(data) {
  return data?.token ?? data?.accessToken ?? data?.jwt ?? data?.jwtToken ??
    data?.access_token ?? data?.data?.token ?? data?.data?.accessToken ?? '';
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const token = getToken(response);
      if (!token) throw new Error('Login response did not contain a token.');
      const claims = decodeJwt(token);
      // The backend LoginResponse is { token, email, role }.
      const role = normalizeRole(
        response?.role ?? response?.user?.role ?? response?.data?.role ??
        claims?.role ?? claims?.userRole
      );
      if (!['ADMIN', 'FAMILY', 'DONOR'].includes(role)) {
        throw new Error('Login succeeded, but the account role could not be identified. Check LoginResponse.java and the JWT role claim.');
      }
      const user = {
        ...(response?.user || {}),
        email: response?.email || response?.user?.email || email.trim(),
        firstName: response?.user?.firstName || '',
        lastName: response?.user?.lastName || '',
        role,
      };
      localStorage.setItem('token', token);
      ['user', 'currentUser', 'loggedInUser'].forEach(key => localStorage.setItem(key, JSON.stringify(user)));
      if (role === 'ADMIN') navigate('/admin', { replace: true });
      else if (role === 'FAMILY') navigate('/children', { replace: true });
      else navigate('/donate', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <Link to="/" className="login-brand">HopeHaven</Link>
        <p className="login-eyebrow">WELCOME BACK</p>
        <h1>Login to HopeHaven</h1>
        <p className="login-subtitle">Sign in to continue making a difference.</p>
        {error && <div className="login-error" role="alert">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} required disabled={loading} />
          <label htmlFor="login-password">Password</label>
          <div className="password-field">
            <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={event => setPassword(event.target.value)} required disabled={loading} />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} disabled={loading}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
          <button className="login-submit" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="login-footer">Don't have an account? <Link to="/register">Create an account</Link></p>
        <Link to="/" className="login-home-link">← Back to Home</Link>
      </section>
    </main>
  );
}
export default Login;
