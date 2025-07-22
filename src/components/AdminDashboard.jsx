import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import CoachDashboard from './CoachDashboard'; // <-- This line was missing

function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalSize: 0, fileCount: 0 });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      // In testing mode, we don't need a token. For production, you'd re-enable this.
      // if (!token) return; 
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/get-metrics', {
          // headers: { Authorization: `Bearer ${token}` }, // Also re-enable for production
        });
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token]); // The dependency array is fine even in testing mode

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
    </div>
  );
}

export default AdminDashboard;
