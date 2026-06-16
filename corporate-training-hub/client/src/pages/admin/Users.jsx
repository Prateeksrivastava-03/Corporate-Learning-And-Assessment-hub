import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Spinner, EmptyState, Badge, Modal } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = () => api.getUsers().then(r => setUsers(r.data.users)).catch(() => toast.error('Failed to load users')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updateUser(editUser._id, editUser);
      toast.success('User updated');
      setEditUser(null);
      load();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.deleteUser(id); toast.success('User deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <Spinner text="Loading users..." />;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} total users registered</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        {['all', 'admin', 'trainer', 'employee'].map(r => (
          <button key={r} className={`btn ${roleFilter === r ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setRoleFilter(r)} style={{ textTransform: 'capitalize' }}>{r}</button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? <EmptyState icon="👤" title="No users found" /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{u.name.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td><Badge variant={u.role === 'admin' ? 'red' : u.role === 'trainer' ? 'gold' : 'accent'}>{u.role}</Badge></td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{u.department || '—'}</td>
                    <td><Badge variant={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditUser({ ...u })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User"
        actions={<>
          <button className="btn btn-outline" onClick={() => setEditUser(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
        </>}>
        {editUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={editUser.name} onChange={e => setEditUser(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={editUser.email} onChange={e => setEditUser(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input form-select" value={editUser.role} onChange={e => setEditUser(p => ({ ...p, role: e.target.value }))}>
                  <option value="employee">Employee</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input form-select" value={editUser.isActive} onChange={e => setEditUser(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={editUser.department || ''} onChange={e => setEditUser(p => ({ ...p, department: e.target.value }))} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
