import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { userService } from '../../services';
import { NAV } from './AdminDashboard';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('customer');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({ role: roleFilter || undefined });
      setUsers(res.data.users);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const toggleStatus = async (user) => {
    try {
      await userService.toggleStatus(user._id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update user.'); }
  };

  return (
    <DashboardLayout navItems={NAV} title="User Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Users</h2>
          <p>Manage all platform users</p>
        </div>
      </div>

      <div className="filter-bar">
        {['customer', 'provider', ''].map(r => (
          <button key={r || 'all'} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRoleFilter(r)}>
            {r ? r.charAt(0).toUpperCase() + r.slice(1) + 's' : 'All Users'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontSize: '0.875rem' }}>{u.email}</td>
                  <td style={{ fontSize: '0.875rem' }}>{u.phone || '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-in-progress' : u.role === 'provider' ? 'badge-accepted' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.isActive ? <><X size={13} /> Deactivate</> : <><Check size={13} /> Activate</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No users found</h3>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
