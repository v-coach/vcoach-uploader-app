import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import CoachDashboard from './CoachDashboard';

// --- Edit User Modal (Updated) ---
const EditUserModal = ({ user, onConfirm, onCancel }) => {
  const [roles, setRoles] = useState(user.roles);
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(user.username, roles, newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Edit User: {user.username}</h2>
        
        <label className="text-sm font-medium text-white/80 block mb-2">Roles</label>
        <select value={roles.join(',')} onChange={e => setRoles(e.target.value.split(','))} className="w-full h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white mb-4">
          <option value="Coach">Coach</option>
          <option value="Head Coach">Head Coach</option>
          <option value="Coach,Head Coach">Coach & Head Coach</option>
          <option value="Founders">Admin (Founders)</option>
        </select>

        <label className="text-sm font-medium text-white/80 block mb-2">Reset Password (Optional)</label>
        <input
          type="password"
          placeholder="Enter new password to reset"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white"
        />

        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onCancel} className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium">Cancel</button>
          <button type="submit" className="h-10 px-5 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

// --- User Management Component ---
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ username: '', password: '', roles: ['Coach'] });
  const [editingUser, setEditingUser] = useState(null);
  const { token } = useAuth();

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get('/.netlify/functions/manage-users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return alert('Username and password are required.');
    try {
      await axios.post('/.netlify/functions/manage-users', newUser, { headers: { Authorization: `Bearer ${token}` } });
      setNewUser({ username: '', password: '', roles: ['Coach'] });
      fetchUsers();
    } catch (err) {
      alert('Failed to create user.');
    }
  };

  const handleUpdateUser = async (username, roles, newPassword) => {
    try {
      const payload = { username, roles };
      if (newPassword) {
        payload.password = newPassword;
      }
      await axios.put('/.netlify/functions/manage-users', payload, { headers: { Authorization: `Bearer ${token}` } });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete user '${username}'?`)) {
      try {
        await axios.delete('/.netlify/functions/manage-users', { headers: { Authorization: `Bearer ${token}` }, data: { username } });
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <>
      {editingUser && <EditUserModal user={editingUser} onConfirm={handleUpdateUser} onCancel={() => setEditingUser(null)} />}
      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl h-full flex flex-col">
        <div className="p-6"><h2 className="text-3xl font-bold tracking-tight text-white">User Management</h2></div>
        <form onSubmit={handleCreateUser} className="p-6 border-b border-white/20 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <input type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white" />
          <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white" />
          <select value={newUser.roles.join(',')} onChange={e => setNewUser({...newUser, roles: e.target.value.split(',')})} className="h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white col-span-1 md:col-span-2">
            <option value="Coach">Coach</option>
            <option value="Head Coach">Head Coach</option>
            <option value="Coach,Head Coach">Coach & Head Coach</option>
            <option value="Founders">Admin (Founders)</option>
          </select>
          <button type="submit" className="h-12 px-6 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-base font-bold col-span-1 md:col-span-2">Create User</button>
        </form>
        <div className="overflow-y-auto flex-grow">
          <table className="w-full text-sm">
            <thead className="[&_tr]:border-b border-white/20">
              <tr>
                <th className="h-12 px-4 text-left font-medium text-white/60">Username</th>
                <th className="h-12 px-4 text-left font-medium text-white/60">Roles</th>
                <th className="h-12 px-4 text-right font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="p-4 text-center text-white/60">Loading users...</td></tr>
              ) : users.map(user => (
                <tr key={user.username} className="border-b border-white/20 last:border-b-0">
                  <td className="p-4 text-white">{user.username}</td>
                  <td className="p-4 text-white/80">{user.roles.join(', ')}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setEditingUser(user)} className="h-9 px-3 bg-gray-500 text-white hover:bg-gray-600 rounded-md text-xs font-medium">Edit</button>
                    <button onClick={() => handleDeleteUser(user.username)} className="h-9 px-3 bg-red-600 text-white hover:bg-red-500 rounded-md text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// --- Log Viewer Component (Updated) ---
const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/get-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  const showMoreLogs = () => {
    setVisibleCount(prevCount => prevCount + 10);
  };

  return (
    <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl h-full flex flex-col">
      <div className="p-6 border-b border-white/20">
        <h2 className="text-3xl font-bold tracking-tight text-white">Action Logs</h2>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="p-4 text-center text-white/60">Loading logs...</p>
        ) : logs.length > 0 ? (
          logs.slice(0, visibleCount).map(log => (
            <div key={log.id} className="p-3 rounded-md bg-white/5 grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <p className="text-white/80 text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                <p className="text-white font-semibold truncate">{log.user}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sky-400 font-semibold">{log.action}</p>
                <p className="text-white/80 text-sm break-words">{log.details}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-white/60">No logs found.</p>
        )}
      </div>
      {logs.length > visibleCount && (
        <div className="p-4 text-center border-t border-white/20">
          <button onClick={showMoreLogs} className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium">Show More</button>
        </div>
      )}
    </div>
  );
};

// --- Main Admin Dashboard Component ---
function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalSize: 0, fileCount: 0 });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/get-metrics', { headers: { Authorization: `Bearer ${token}` } });
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token]);

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">Admin Overview</h1>
        <p className="text-white/80 mt-2">View storage metrics and manage all site data.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg p-6">
          <h3 className="tracking-tight text-sm font-medium text-white/80">Total Storage Used</h3>
          <div className="mt-2">
            {loading ? (<div className="h-8 w-24 bg-white/20 rounded-md animate-pulse"></div>) : (<div className="text-3xl font-bold text-white">{(metrics.totalSize / 1024 / 1024 / 1024).toFixed(3)} GB</div>)}
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg p-6">
          <h3 className="tracking-tight text-sm font-medium text-white/80">Total Files</h3>
          <div className="mt-2">
            {loading ? (<div className="h-8 w-16 bg-white/20 rounded-md animate-pulse"></div>) : (<div className="text-3xl font-bold text-white">{metrics.fileCount}</div>)}
          </div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <UserManagement />
        <LogViewer />
      </div>
      <div className="mt-4">
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">File Management</h2>
        <CoachDashboard />
      </div>
    </div>
  );
}

export default AdminDashboard;
