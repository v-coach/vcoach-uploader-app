import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

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
        <h1 className="text-4xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">View storage metrics and manage all site data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Storage Used</h3>
          </div>
          <div className="p-6 pt-0">
            {loading ? (
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold">{(metrics.totalSize / 1024 / 1024 / 1024).toFixed(3)} GB</div>
            )}
            <p className="text-xs text-muted-foreground">Total size of all VoDs in R2</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Files</h3>
          </div>
          <div className="p-6 pt-0">
            {loading ? (
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold">{metrics.fileCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Total number of VoDs uploaded</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">File Management</h2>
        <p className="text-muted-foreground mb-4">Admins have the same file management capabilities as coaches.</p>
        {/* For simplicity, the Admin dashboard re-uses the CoachDashboard component for file management */}
        <CoachDashboard />
      </div>
    </div>
  );
}

export default AdminDashboard;
