import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import CoachDashboard from './CoachDashboard';
import CoachManagement from './CoachManagement';
import PricingManagement from './PricingManagement';

// --- Info Card Component (Same as Coach Dashboard) ---
const InfoCard = ({ icon, title, value, subtitle, color = "sky" }) => {
  const colorClasses = {
    sky: "border-sky-500/30 bg-sky-500/10",
    green: "border-green-500/30 bg-green-500/10", 
    purple: "border-purple-500/30 bg-purple-500/10",
    orange: "border-orange-500/30 bg-orange-500/10",
    red: "border-red-500/30 bg-red-500/10",
    blue: "border-blue-500/30 bg-blue-500/10",
    yellow: "border-yellow-500/30 bg-yellow-500/10"
  };

  const iconColorClasses = {
    sky: "text-sky-400",
    green: "text-green-400",
    purple: "text-purple-400", 
    orange: "text-orange-400",
    red: "text-red-400",
    blue: "text-blue-400",
    yellow: "text-yellow-400"
  };

  return (
    <div className={`rounded-xl border ${colorClasses[color]} backdrop-blur-lg p-4 transition-all hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/60">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-xl ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// --- Edit User Modal (Compact) ---
const EditUserModal = ({ user, onConfirm, onCancel }) => {
  const [roles, setRoles] = useState(user.roles);
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(user.username, roles, newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold text-white mb-3">Edit User: {user.username}</h2>
        
        <label className="text-xs font-medium text-white/80 block mb-1">Roles</label>
        <select value={roles.join(',')} onChange={e => setRoles(e.target.value.split(','))} className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white mb-3">
          <option value="Coach">Coach</option>
          <option value="Head Coach">Head Coach</option>
          <option value="Coach,Head Coach">Coach & Head Coach</option>
          <option value="Founders">Admin (Founders)</option>
        </select>

        <label className="text-xs font-medium text-white/80 block mb-1">Reset Password (Optional)</label>
        <input
          type="password"
          placeholder="Enter new password to reset"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50"
        />

        <div className="flex justify-end space-x-3 mt-4">
          <button type="button" onClick={onCancel} className="h-9 px-4 bg-white/10 text-white hover:bg-white/20 rounded-md text-xs font-medium">Cancel</button>
          <button type="submit" className="h-9 px-4 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-xs font-bold">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

// --- User Management Component (Compact) ---
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
      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl flex-1 min-h-0">
        <div className="p-0 flex flex-col h-full">
          {/* Header with Create Form */}
          <div className="p-4 border-b border-white/20">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-3">User Management</h2>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <input 
                type="text" 
                placeholder="Username" 
                value={newUser.username} 
                onChange={e => setNewUser({...newUser, username: e.target.value})} 
                className="h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50" 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={newUser.password} 
                onChange={e => setNewUser({...newUser, password: e.target.value})} 
                className="h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50" 
              />
              <select 
                value={newUser.roles.join(',')} 
                onChange={e => setNewUser({...newUser, roles: e.target.value.split(',')})} 
                className="h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white col-span-1 md:col-span-2"
              >
                <option value="Coach">Coach</option>
                <option value="Head Coach">Head Coach</option>
                <option value="Coach,Head Coach">Coach & Head Coach</option>
                <option value="Founders">Admin (Founders)</option>
              </select>
              <button type="submit" className="h-10 px-4 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold col-span-1 md:col-span-2">
                Create User
              </button>
            </form>
          </div>
          
          {/* Users Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b border-white/20">
                <tr className="transition-colors">
                  <th className="h-10 px-3 text-left align-middle font-medium text-white/60">Username</th>
                  <th className="h-10 px-3 text-left align-middle font-medium text-white/60">Roles</th>
                  <th className="h-10 px-3 text-right align-middle font-medium text-white/60">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr><td colSpan="3" className="p-6 text-center text-white/60">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                      <span>Loading users...</span>
                    </div>
                  </td></tr>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.username} className="border-b border-white/20 transition-colors hover:bg-white/5">
                      <td className="p-3 align-middle font-medium text-white">{user.username}</td>
                      <td className="p-3 align-middle text-white/80">{user.roles.join(', ')}</td>
                      <td className="p-3 align-middle text-right space-x-1">
                        <button onClick={() => setEditingUser(user)} className="h-8 px-2 bg-gray-500 text-white hover:bg-gray-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteUser(user.username)} className="h-8 px-2 bg-red-600 text-white hover:bg-red-500 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="text-3xl">👥</div>
                      <div className="text-white/60">No users found</div>
                      <div className="text-white/40 text-sm">Create your first user above</div>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Log Viewer Component (Compact) ---
const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
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
    <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl flex-1 min-h-0">
      <div className="p-0 flex flex-col h-full">
        <div className="p-4 border-b border-white/20">
          <h2 className="text-2xl font-bold tracking-tight text-white">Recent Activity</h2>
        </div>
        <div className="flex-grow overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="p-6 text-center text-white/60">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                <span>Loading activity...</span>
              </div>
            </div>
          ) : logs.length > 0 ? (
            logs.slice(0, visibleCount).map(log => (
              <div key={log.id} className="p-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sky-400 font-semibold text-sm">{log.action}</span>
                      <span className="text-white/40 text-xs">•</span>
                      <span className="text-white/60 text-xs">{log.user}</span>
                    </div>
                    <p className="text-white/80 text-sm mt-1 break-words">{log.details}</p>
                  </div>
                  <span className="text-white/40 text-xs whitespace-nowrap ml-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="text-3xl">📊</div>
                <div className="text-white/60">No activity logs found</div>
                <div className="text-white/40 text-sm">User actions will appear here</div>
              </div>
            </div>
          )}
        </div>
        {logs.length > visibleCount && (
          <div className="p-3 text-center border-t border-white/20">
            <button onClick={showMoreLogs} className="h-8 px-4 bg-white/10 text-white hover:bg-white/20 rounded-md text-xs font-medium">
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Admin Dashboard Component ---
function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalSize: 0, fileCount: 0, userCount: 0, coachCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { token } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/get-metrics', { headers: { Authorization: `Bearer ${token}` } });
        
        // Fetch additional user metrics
        const usersRes = await axios.get('/.netlify/functions/manage-users', { headers: { Authorization: `Bearer ${token}` } });
        const users = usersRes.data || [];
        const userCount = users.length;
        const coachCount = users.filter(user => user.roles.includes('Coach') || user.roles.includes('Head Coach')).length;
        
        setMetrics({
          ...res.data,
          userCount,
          coachCount
        });
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token]);

  const formatFileSize = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'coaches', name: 'Coaches', icon: '👥' },
    { id: 'pricing', name: 'Pricing', icon: '💰' },
    { id: 'users', name: 'Users', icon: '🔐' },
    { id: 'files', name: 'Files', icon: '📁' }
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* Header Section */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">Admin Dashboard</h1>
        <p className="text-white/80 mt-1">Manage your V-Coach platform and monitor all activities.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-white/20 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border-b-2 border-sky-400'
                : 'text-white/70 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4 flex-1 min-h-0">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard 
              icon="💾"
              title="Storage Used"
              value={formatFileSize(metrics.totalSize)}
              subtitle="Total platform storage"
              color="purple"
            />
            <InfoCard 
              icon="📁"
              title="Total Files"
              value={loading ? "..." : metrics.fileCount.toLocaleString()}
              subtitle="VoD uploads"
              color="sky"
            />
            <InfoCard 
              icon="👥"
              title="Total Users"
              value={loading ? "..." : metrics.userCount.toLocaleString()}
              subtitle="Platform accounts"
              color="green"
            />
            <InfoCard 
              icon="🎯"
              title="Active Coaches"
              value={loading ? "..." : metrics.coachCount.toLocaleString()}
              subtitle="Coaching staff"
              color="orange"
            />
          </div>
          
          {/* Activity Log */}
          <LogViewer />
        </div>
      )}

      {activeTab === 'coaches' && <CoachManagement />}

      {activeTab === 'pricing' && <PricingManagement />}

      {activeTab === 'users' && <UserManagement />}

      {activeTab === 'files' && <CoachDashboard />}
    </div>
  );
}

export default AdminDashboard;
