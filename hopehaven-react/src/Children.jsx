
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from './api';
import './Children.css';

function readStoredUser() {
  for (const key of ['user', 'currentUser', 'loggedInUser']) {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // Try the next existing storage key.
    }
  }

  return null;
}

function readTokenClaims(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
}

function getCurrentRole() {
  const user = readStoredUser();
  const token = localStorage.getItem('token');
  const claims = token ? readTokenClaims(token) : {};

  const rawRole =
    user?.role ??
    user?.userRole ??
    claims.role ??
    claims.userRole ??
    claims.authorities?.[0]?.authority ??
    claims.authorities?.[0] ??
    claims.roles?.[0] ??
    '';

  return String(rawRole).replace(/^ROLE_/i, '').toUpperCase();
}

function getChildStatus(child) {
  return String(child.status ?? 'AVAILABLE').toUpperCase();
}

function Children() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;

    apiRequest('/api/children')
      .then((data) => {
        if (!active) return;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : [];

        // Avoid duplicate cards if the API returns duplicate records.
        const uniqueChildren = Array.from(
          new Map(
            list.map((child, index) => [
              child.id ?? `child-${index}`,
              child,
            ])
          ).values()
        );

        setChildren(uniqueChildren);
      })
      .catch((error) => {
        if (active) setPageError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function openAdoptionForm(child) {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
      return;
    }

    const role = getCurrentRole();

    if (role && role !== 'FAMILY') {
      setPageError(
        'Adoption requests require a FAMILY account. Please log in with your family account.'
      );
      return;
    }

    setPageError('');
    setSuccessMessage('');
    setFormError('');
    setMessage('');
    setSelectedChild(child);
  }

  function closeAdoptionForm() {
    if (submitting) return;

    setSelectedChild(null);
    setMessage('');
    setFormError('');
  }

  async function submitAdoptionRequest(event) {
    event.preventDefault();

    if (!selectedChild?.id) {
      setFormError('The selected child could not be identified.');
      return;
    }

    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
      return;
    }

    if (!message.trim()) {
      setFormError('Please tell us why you would like to adopt this child.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await apiRequest('/api/adoptions', {
        method: 'POST',
        body: JSON.stringify({
          childId: selectedChild.id,
          message: message.trim(),
        }),
      });

      setSelectedChild(null);
      setMessage('');
      setSuccessMessage(
        'Your adoption request was submitted successfully.'
      );
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="children-page">
      <header className="children-navbar">
        <Link to="/" className="children-brand">
          HopeHaven
        </Link>

        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/children" className="active">
            Children
          </Link>
          <Link to="/donate">Donate</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <section className="children-hero">
        <p className="children-eyebrow">EVERY CHILD DESERVES A LOVING HOME</p>
        <h1>Meet the Children</h1>
        <p>
          Every child has a story. Help create a future filled with care,
          safety, and belonging.
        </p>
      </section>

      <main className="children-content">
        {pageError && (
          <div className="children-alert error" role="alert">
            {pageError}
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => setPageError('')}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="children-alert success" role="status">
            {successMessage}
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => setSuccessMessage('')}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <div className="children-state" role="status">
            <span className="children-spinner" />
            <p>Loading children...</p>
          </div>
        )}

        {!loading && !pageError && children.length === 0 && (
          <div className="children-state">
            <h2>No children listed yet</h2>
            <p>Please check back later.</p>
          </div>
        )}

        {!loading && children.length > 0 && (
          <section className="children-grid" aria-label="Children available">
            {children.map((child) => {
              const status = getChildStatus(child);
              const available = status === 'AVAILABLE';

              return (
                <article className="child-card" key={child.id}>
                  <div className="child-card-art" aria-hidden="true">
                    <span>♡</span>
                  </div>

                  <div className="child-card-body">
                    <span
                      className={`child-status ${
                        available ? 'available' : 'unavailable'
                      }`}
                    >
                      {status.replaceAll('_', ' ')}
                    </span>

                    <h2>{child.name || 'Child'}</h2>

                    <p className="child-meta">
                      {child.age != null ? `${child.age} years old` : ''}
                      {child.city
                        ? `${child.age != null ? ' · ' : ''}${child.city}`
                        : ''}
                    </p>

                    {child.bio && (
                      <p className="child-bio">{child.bio}</p>
                    )}

                    {child.interests && (
                      <p className="child-interests">
                        <strong>Interests:</strong>{' '}
                        {Array.isArray(child.interests)
                          ? child.interests.join(', ')
                          : child.interests}
                      </p>
                    )}

                    <button
                      type="button"
                      className="adoption-button"
                      disabled={!available}
                      onClick={() => openAdoptionForm(child)}
                    >
                      {available ? 'Request Adoption' : 'Not Available'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {selectedChild && (
        <div
          className="adoption-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAdoptionForm();
            }
          }}
        >
          <section
            className="adoption-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="adoption-modal-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeAdoptionForm}
              disabled={submitting}
              aria-label="Close adoption form"
            >
              ×
            </button>

            <p className="children-eyebrow">TAKE THE NEXT STEP</p>
            <h2 id="adoption-modal-title">
              Adoption Request for {selectedChild.name}
            </h2>
            <p className="modal-description">
              Tell our team why you would like to adopt this child.
            </p>

            <form onSubmit={submitAdoptionRequest}>
              <label htmlFor="adoption-message">
                Your message <span aria-hidden="true">*</span>
              </label>

              <textarea
                id="adoption-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share a little about your family and your interest in adoption..."
                maxLength={1000}
                rows={5}
                required
                disabled={submitting}
              />

              <p className="character-count">{message.length}/1000</p>

              {formError && (
                <div className="children-alert error" role="alert">
                  {formError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeAdoptionForm}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="adoption-button"
                  disabled={submitting || !message.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Children;
