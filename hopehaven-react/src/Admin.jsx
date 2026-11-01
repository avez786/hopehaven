import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiRequest } from './api';
import './Admin.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'children', label: 'Children' },
  { id: 'adoptions', label: 'Adoption requests' },
  { id: 'donations', label: 'Donations' },
  { id: 'users', label: 'Users' },
];

function storedUser() {
  for (const key of ['user', 'currentUser', 'loggedInUser']) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      if (value && typeof value === 'object') return value;
    } catch { /* try next key */ }
  }
  return null;
}

function roleFromSession() {
  const user = storedUser();
  let role = user?.role || '';
  if (!role) {
    try {
      const token = localStorage.getItem('token');
      const payload = token?.split('.')[1];
      if (payload) {
        const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        role = claims.role || claims.userRole || '';
      }
    } catch { /* invalid token */ }
  }
  return String(role).replace(/^ROLE_/i, '').toUpperCase();
}

function listFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function dateText(value) {
  if (!value) return '—';
  const parsed = Array.isArray(value)
    ? new Date(value[0], (value[1] || 1) - 1, value[2] || 1, value[3] || 0, value[4] || 0)
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
}

const EMPTY_CHILD = {
  name: '', age: '', city: '', bio: '', interests: '', imageEmoji: '💚',
};

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [children, setChildren] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [donationTotal, setDonationTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [childForm, setChildForm] = useState(EMPTY_CHILD);
  const [editingId, setEditingId] = useState(null);
  const [showChildForm, setShowChildForm] = useState(false);
  const [search, setSearch] = useState('');

  const role = roleFromSession();

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      apiRequest('/api/children'),
      apiRequest('/api/adoptions'),
      apiRequest('/api/donations'),
      apiRequest('/api/users'),
      apiRequest('/api/donations/total'),
      apiRequest('/api/donations/category'),
      apiRequest('/api/donations/recent'),
    ]);
    const [childRes, adoptionRes, donationRes, userRes, totalRes, categoryRes, recentRes] = results;
    const failures = [];
    const accept = (result, label, setter) => {
      if (result.status === 'fulfilled') setter(result.value);
      else failures.push(`${label}: ${result.reason?.message || 'request failed'}`);
    };
    accept(childRes, 'Children', value => setChildren(listFrom(value)));
    accept(adoptionRes, 'Adoption requests', value => setAdoptions(listFrom(value)));
    accept(donationRes, 'Donations', value => setDonations(listFrom(value)));
    accept(userRes, 'Users', value => setUsers(listFrom(value)));
    accept(totalRes, 'Donation total', value => setDonationTotal(
      typeof value === 'number' ? value : value?.total ?? value?.amount ?? 0
    ));
    accept(categoryRes, 'Donation categories', value => setCategoryTotals(
      value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    ));
    accept(recentRes, 'Recent donations', value => setRecentDonations(listFrom(value)));
    if (failures.length) setError(failures.join(' • '));
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const pendingAdoptions = useMemo(
    () => adoptions.filter(item => String(item.status || '').toUpperCase() === 'PENDING'),
    [adoptions]
  );
  const availableChildren = children.filter(
    item => String(item.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE'
  ).length;
  const filteredChildren = children.filter(child =>
    `${child.name || ''} ${child.city || ''} ${child.status || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter(user =>
    `${user.firstName || ''} ${user.lastName || ''} ${user.email || ''} ${user.role || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/" replace />;

  function logout() {
    ['token', 'user', 'currentUser', 'loggedInUser'].forEach(key => localStorage.removeItem(key));
    window.location.replace('/login');
  }

  function startAddChild() {
    setEditingId(null);
    setChildForm(EMPTY_CHILD);
    setError('');
    setNotice('');
    setShowChildForm(true);
  }

  function startEditChild(child) {
    setEditingId(child.id);
    setChildForm({
      name: child.name || '',
      age: child.age ?? '',
      city: child.city || '',
      bio: child.bio || '',
      interests: Array.isArray(child.interests) ? child.interests.join(', ') : child.interests || '',
      imageEmoji: child.imageEmoji || '💚',
    });
    setError('');
    setNotice('');
    setShowChildForm(true);
  }

  async function saveChild(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    const payload = {
      name: childForm.name.trim(),
      age: Number(childForm.age),
      city: childForm.city.trim(),
      bio: childForm.bio.trim(),
      interests: childForm.interests.trim(),
      imageEmoji: childForm.imageEmoji.trim() || '💚',
    };
    try {
      await apiRequest(editingId ? `/api/children/${editingId}` : '/api/children', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setShowChildForm(false);
      setNotice(editingId ? 'Child details updated.' : 'Child added successfully.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Unable to save child.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteChild(child) {
    if (!window.confirm(`Delete ${child.name || 'this child'}? This cannot be undone.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await apiRequest(`/api/children/${child.id}`, { method: 'DELETE' });
      setNotice('Child deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Unable to delete child.');
    } finally { setBusy(false); }
  }

  async function updateAdoption(request, action) {
    const verb = action === 'approve' ? 'approve' : 'reject';
    if (action === 'approve' && !window.confirm(`Approve adoption request #${request.id}? The child will be marked ADOPTED.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await apiRequest(`/api/adoptions/${request.id}/${verb}`, { method: 'PUT' });
      setNotice(`Adoption request #${request.id} ${verb}d successfully.`);
      await loadAll();
    } catch (err) {
      setError(err.message || `Unable to ${verb} request.`);
    } finally { setBusy(false); }
  }

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <Link className="admin-brand" to="/">HopeHaven <span>ADMIN</span></Link>
        <div className="admin-top-actions">
          <Link to="/">View website</Link>
          <button type="button" onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <p className="admin-side-label">WORKSPACE</p>
          {TABS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => { setTab(item.id); setSearch(''); setError(''); setNotice(''); }}
            >
              {item.label}
              {item.id === 'adoptions' && pendingAdoptions.length > 0 && (
                <span className="admin-count">{pendingAdoptions.length}</span>
              )}
            </button>
          ))}
          <div className="admin-sidebar-bottom">
            <span className="admin-avatar">A</span>
            <div><strong>Administrator</strong><small>HopeHaven workspace</small></div>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-page-heading">
            <div>
              <p className="admin-kicker">HOPEHAVEN MANAGEMENT</p>
              <h1>{TABS.find(item => item.id === tab)?.label}</h1>
              <p className="admin-muted">Manage children, families, adoption requests and donations.</p>
            </div>
            <button className="admin-refresh" onClick={loadAll} disabled={loading || busy} type="button">
              {loading ? 'Refreshing…' : '↻ Refresh data'}
            </button>
          </div>

          {error && <div className="admin-alert error" role="alert">{error}</div>}
          {notice && <div className="admin-alert success" role="status">{notice}</div>}

          {loading ? <div className="admin-loading">Loading dashboard data…</div> : (
            <>
              {tab === 'overview' && (
                <>
                  <section className="admin-stats-grid">
                    <article className="admin-stat-card"><span>Total children</span><strong>{children.length}</strong><small>{availableChildren} available</small></article>
                    <article className="admin-stat-card"><span>Pending adoptions</span><strong>{pendingAdoptions.length}</strong><small>Awaiting review</small></article>
                    <article className="admin-stat-card"><span>Total donations</span><strong>{money(donationTotal)}</strong><small>{donations.length} recorded donations</small></article>
                    <article className="admin-stat-card"><span>Registered users</span><strong>{users.length}</strong><small>Families and donors</small></article>
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><h2>Pending adoption requests</h2><p>Review applications that need attention.</p></div><button className="admin-secondary" onClick={() => setTab('adoptions')}>View all</button></div>
                    {pendingAdoptions.length === 0 ? <p className="admin-empty">There are no pending adoption requests.</p> : (
                      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Child</th><th>Applicant</th><th>Requested</th><th>Actions</th></tr></thead><tbody>
                        {pendingAdoptions.slice(0, 5).map(request => <tr key={request.id}>
                          <td><strong>{request.child?.name || `Child #${request.child?.id ?? '—'}`}</strong><small>Request #{request.id}</small></td>
                          <td>{[request.user?.firstName, request.user?.lastName].filter(Boolean).join(' ') || request.user?.email || 'Unknown'}<small>{request.user?.email || ''}</small></td>
                          <td>{dateText(request.requestedAt)}</td>
                          <td className="admin-actions-cell"><button className="admin-approve" disabled={busy} onClick={() => updateAdoption(request, 'approve')}>Approve</button><button className="admin-reject" disabled={busy} onClick={() => updateAdoption(request, 'reject')}>Reject</button></td>
                        </tr>)}
                      </tbody></table></div>
                    )}
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><h2>Recent donations</h2><p>Latest recorded contributions.</p></div><button className="admin-secondary" onClick={() => setTab('donations')}>View all</button></div>
                    {recentDonations.length === 0 ? <p className="admin-empty">No donations have been recorded yet.</p> : (
                      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Donor</th><th>Category</th><th>Frequency</th><th>Amount</th></tr></thead><tbody>
                        {recentDonations.map((donation, index) => <tr key={donation.id ?? index}><td>{donation.donorName || donation.user?.email || donation.donorEmail || 'Donor'}<small>{donation.donorEmail || ''}</small></td><td>{donation.category || '—'}</td><td>{donation.frequency || '—'}</td><td><strong>{money(donation.amount)}</strong></td></tr>)}
                      </tbody></table></div>
                    )}
                  </section>
                </>
              )}

              {tab === 'children' && (
                <section className="admin-panel">
                  <div className="admin-panel-heading"><div><h2>Children directory</h2><p>Add and maintain the children shown on the public page.</p></div><button className="admin-primary" onClick={startAddChild}>＋ Add child</button></div>
                  <div className="admin-list-tools"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, city or status…" aria-label="Search children" /></div>
                  {showChildForm && <form className="admin-child-form" onSubmit={saveChild}>
                    <h3>{editingId ? `Edit child #${editingId}` : 'Add a child'}</h3>
                    <div className="admin-form-grid">
                      <label>Full name<input value={childForm.name} maxLength={100} required onChange={e => setChildForm({...childForm, name:e.target.value})}/></label>
                      <label>Age<input type="number" min="0" max="18" value={childForm.age} required onChange={e => setChildForm({...childForm, age:e.target.value})}/></label>
                      <label>City<input value={childForm.city} maxLength={100} required onChange={e => setChildForm({...childForm, city:e.target.value})}/></label>
                      <label>Image emoji<input value={childForm.imageEmoji} maxLength={20} onChange={e => setChildForm({...childForm, imageEmoji:e.target.value})}/></label>
                      <label className="wide">Interests<input value={childForm.interests} maxLength={500} placeholder="Reading, music, sports" onChange={e => setChildForm({...childForm, interests:e.target.value})}/></label>
                      <label className="wide">Bio<textarea value={childForm.bio} maxLength={1000} required rows={3} onChange={e => setChildForm({...childForm, bio:e.target.value})}/></label>
                    </div>
                    <div className="admin-form-actions"><button type="button" className="admin-secondary" disabled={busy} onClick={() => setShowChildForm(false)}>Cancel</button><button className="admin-primary" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save child'}</button></div>
                  </form>}
                  <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Child</th><th>Age / City</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                    {filteredChildren.map(child => <tr key={child.id}><td><strong>{child.imageEmoji || '♡'} {child.name}</strong><small>{child.bio || 'No bio added'}</small></td><td>{child.age} years · {child.city}</td><td><span className={`admin-status ${String(child.status || 'AVAILABLE').toLowerCase()}`}>{child.status || 'AVAILABLE'}</span></td><td className="admin-actions-cell"><button className="admin-secondary" disabled={busy} onClick={() => startEditChild(child)}>Edit</button><button className="admin-reject" disabled={busy} onClick={() => deleteChild(child)}>Delete</button></td></tr>)}
                    {filteredChildren.length === 0 && <tr><td colSpan="4" className="admin-empty">No children match your search.</td></tr>}
                  </tbody></table></div>
                </section>
              )}

              {tab === 'adoptions' && (
                <section className="admin-panel">
                  <div className="admin-panel-heading"><div><h2>Adoption applications</h2><p>Approve or reject pending requests. Approval marks the child as adopted.</p></div></div>
                  <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Child</th><th>Applicant</th><th>Message</th><th>Date</th><th>Status / Actions</th></tr></thead><tbody>
                    {adoptions.map(request => <tr key={request.id}><td><strong>{request.child?.name || `Child #${request.child?.id ?? '—'}`}</strong><small>Request #{request.id}</small></td><td>{[request.user?.firstName, request.user?.lastName].filter(Boolean).join(' ') || '—'}<small>{request.user?.email || ''}</small></td><td className="admin-message-cell">{request.message || '—'}</td><td>{dateText(request.requestedAt)}</td><td><span className={`admin-status ${String(request.status || '').toLowerCase()}`}>{request.status || 'UNKNOWN'}</span>{String(request.status).toUpperCase() === 'PENDING' && <div className="admin-actions-cell inline"><button className="admin-approve" disabled={busy} onClick={() => updateAdoption(request, 'approve')}>Approve</button><button className="admin-reject" disabled={busy} onClick={() => updateAdoption(request, 'reject')}>Reject</button></div>}</td></tr>)}
                    {adoptions.length === 0 && <tr><td colSpan="5" className="admin-empty">No adoption requests found.</td></tr>}
                  </tbody></table></div>
                </section>
              )}

              {tab === 'donations' && (
                <>
                  <section className="admin-stats-grid two"><article className="admin-stat-card"><span>Total donated</span><strong>{money(donationTotal)}</strong></article><article className="admin-stat-card"><span>Number of donations</span><strong>{donations.length}</strong></article></section>
                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><h2>Donations by category</h2><p>Total recorded amount for each category.</p></div></div>
                    {Object.keys(categoryTotals).length === 0 ? <p className="admin-empty">No category totals available.</p> : <div className="admin-category-grid">{Object.entries(categoryTotals).map(([name, total]) => <div className="admin-category-card" key={name}><span>{name}</span><strong>{money(total)}</strong></div>)}</div>}
                  </section>
                  <section className="admin-panel"><div className="admin-panel-heading"><div><h2>All donations</h2><p>Donor details and recorded contributions.</p></div></div>
                    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Donor</th><th>Category</th><th>Frequency</th><th>Date</th><th>Amount</th></tr></thead><tbody>
                      {[...donations].sort((a,b) => String(b.donatedAt || '').localeCompare(String(a.donatedAt || ''))).map((donation,index) => <tr key={donation.id ?? index}><td><strong>{donation.donorName || 'Donor'}</strong><small>{donation.donorEmail || donation.user?.email || ''}</small></td><td>{donation.category || '—'}</td><td>{donation.frequency || '—'}</td><td>{dateText(donation.donatedAt)}</td><td><strong>{money(donation.amount)}</strong></td></tr>)}
                      {donations.length === 0 && <tr><td colSpan="5" className="admin-empty">No donations found.</td></tr>}
                    </tbody></table></div>
                  </section>
                </>
              )}

              {tab === 'users' && (
                <section className="admin-panel">
                  <div className="admin-panel-heading"><div><h2>Registered users</h2><p>View accounts registered with HopeHaven.</p></div><span className="admin-total-pill">{users.length} users</span></div>
                  <div className="admin-list-tools"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or role…" aria-label="Search users" /></div>
                  <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Email</th><th>Phone</th><th>City</th><th>Role</th></tr></thead><tbody>
                    {filteredUsers.map(user => <tr key={user.id}><td><strong>{[user.firstName,user.lastName].filter(Boolean).join(' ') || 'Unnamed user'}</strong><small>ID #{user.id}</small></td><td>{user.email}</td><td>{user.phone || '—'}</td><td>{user.city || '—'}</td><td><span className={`admin-status ${String(user.role || '').toLowerCase()}`}>{user.role || '—'}</span></td></tr>)}
                    {filteredUsers.length === 0 && <tr><td colSpan="5" className="admin-empty">No users match your search.</td></tr>}
                  </tbody></table></div>
                </section>
              )}
            </>
          )}
          <footer className="admin-footer">HopeHaven Admin · Keep every action centred on children's well-being.</footer>
        </main>
      </div>
    </div>
  );
}
