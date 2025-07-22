import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import CoachDashboard from './CoachDashboard';

// --- NEW User Management Component ---
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ username: '', password: '', roles: ['Coach'] });
  const { token } = useAuth();

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get('/.netlify/functions/manage-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    if (!newUser.username || !newUser.password) {
      alert('Username and password are required.');
      return;
    }
    try {
      await axios.post('/.netlify/functions/manage-users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({ username: '', password: '', roles: ['Coach'] }); // Reset form
      fetchUsers(); // Refresh user list
    } catch (err) {
      alert('Failed to create user.');
      console.error(err);
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete user '${username}'?`)) {
      try {
        await axios.delete('/.netlify/functions/manage-users', {
          headers: { Authorization: `Bearer ${token}` },
          data: { username },
        });
        fetchUsers(); // Refresh user list
      } catch (err) {
        alert('Failed to delete user.');
        console.error(err);
      }
    }
  };

  return (
    <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl mt-8">
      <div className="p-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">User Management</h2>
      </div>
      {/* Create User Form */}
      <form onSubmit={handleCreateUser} className="p-6 border-b border-white/20 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <input type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white" />
        <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white" />
        <select value={newUser.roles.join(',')} onChange={e => setNewUser({...newUser, roles: e.target.value.split(',')})} className="h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white">
          <option value="Coach">Coach</option>
          <option value="Head Coach">Head Coach</option>
          <option value="Coach,Head Coach">Coach & Head Coach</option>
          <option value="Founders">Admin (Founders)</option>
        </select>
        <button type="submit" className="h-12 px-6 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-base font-bold">Create User</button>
      </form>
      {/* User List */}
      <div className="overflow-x-auto">
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
              <tr key={user.username} className="border-b border-white/20">
                <td className="p-4 text-white">{user.username}</td>
                <td className="p-4 text-white/80">{user.roles.join(', ')}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDeleteUser(user.username)} className="h-9 px-3 bg-red-600 text-white hover:bg-red-500 rounded-md text-xs font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


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
    <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl mt-8">
      <div className="p-6"><h2 className="text-3xl font-bold tracking-tight text-white">Action Logs</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b border-white/20">
            <tr>
              <th className="h-12 px-4 text-left align-middle font-medium text-white/60">Timestamp</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-white/60">User</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-white/60">Action</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-white/60">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center text-white/60">Loading logs...</td></tr>
            ) : logs.length > 0 ? (
              logs.slice(0, visibleCount).map(log => (
                <tr key={log.id} className="border-b border-white/20">
                  <td className="p-4 text-white/80 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-white">{log.user}</td>
                  <td className="p-4 text-white/80">{log.action}</td>
                  <td className="p-4 text-white/80">{log.details}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-4 text-center text-white/60">No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {logs.length > visibleCount && (
        <div className="p-4 text-center"><button onClick={showMoreLogs} className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium">Show More</button></div>
      )}
    </div>
  );
};


function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalSize: 0, fileCount: 0 });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/get-metrics', {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    <div className="flex flex-col">
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">Admin Overview</h1>
        <p className="text-white/80 mt-2">View storage metrics and manage all site data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
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
      
      <UserManagement />

      <div className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">File Management</h2>
        <CoachDashboard />
      </div>

      <LogViewer />
    </div>
  );
}

export default AdminDashboard;
