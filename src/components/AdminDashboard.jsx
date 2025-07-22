import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import CoachDashboard from './CoachDashboard';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5); // State to manage how many logs are visible
  const { token } = useAuth();

  useEffect(() => {
    const fetchLogs = async () => {
      // Re-enable token check for production
      // if (!token) return; 
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/get-logs', {
          // headers: { Authorization: `Bearer ${token}` }, // Re-enable for production
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []); // The dependency array is empty to run once on mount

  const showMoreLogs = () => {
    setVisibleCount(prevCount => prevCount + 10); // Show 10 more logs
  };

  return (
    <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl mt-8">
      <div className="p-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">Action Logs</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b border-white/20">
            <tr className="transition-colors">
              <th className="h-12 px-4 text-left align-middle font-medium text-white/60">Timestamp</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-white/60">User</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-white/60">Action</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-white/60">Details</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center text-white/60">Loading logs...</td></tr>
            ) : logs.length > 0 ? (
              logs.slice(0, visibleCount).map(log => (
                <tr key={log.id} className="border-b border-white/20">
                  <td className="p-4 align-middle text-white/80 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 align-middle text-white">{log.user}</td>
                  <td className="p-4 align-middle text-white/80">{log.action}</td>
                  <td className="p-4 align-middle text-white/80">{log.details}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-4 text-center text-white/60">No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {logs.length > visibleCount && (
        <div className="p-4 text-center">
          <button onClick={showMoreLogs} className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium">
            Show More
          </button>
        </div>
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
      // Re-enable token check for production
      // if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/get-metrics', {
          // headers: { Authorization: `Bearer ${token}` }, // Re-enable for production
        });
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []); // The dependency array is empty to run once on mount

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
            {loading ? (
              <div className="h-8 w-24 bg-white/20 rounded-md animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold text-white">{(metrics.totalSize / 1024 / 1024 / 1024).toFixed(3)} GB</div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg p-6">
          <h3 className="tracking-tight text-sm font-medium text-white/80">Total Files</h3>
          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-16 bg-white/20 rounded-md animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold text-white">{metrics.fileCount}</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">File Management</h2>
        <CoachDashboard />
      </div>

      <LogViewer />
    </div>
  );
}

export default AdminDashboard;
