
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from './api';
import './Register.css';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'FAMILY',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      setSuccess('Your account has been created. Redirecting to login...');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-panel">
        <Link to="/" className="register-brand">
          HopeHaven
        </Link>

        <p className="register-eyebrow">MAKE A DIFFERENCE</p>
        <h1>Create your account</h1>
        <p className="register-subtitle">
          Join our community and help children find loving homes.
        </p>

        {error && <div className="register-alert error" role="alert">{error}</div>}
        {success && <div className="register-alert success" role="status">{success}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-name-row">
            <div>
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
                disabled={loading}
              />
            </div>
          </div>

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            disabled={loading}
          />

          <label htmlFor="register-role">Account type</label>
          <select
            id="register-role"
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="FAMILY">Family — adoption requests</option>
            <option value="DONOR">Donor — support children</option>
          </select>

          <label htmlFor="register-password">Password</label>
          <div className="register-password-field">
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={loading}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
            disabled={loading}
          />

          <button className="register-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <Link to="/" className="register-home-link">← Back to Home</Link>
      </section>
    </main>
  );
}

export default Register;
