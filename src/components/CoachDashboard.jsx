import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

function CoachDashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/list-files', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Sort files by most recently modified
        setFiles(res.data.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
      } catch (err) {
        setError('Failed to fetch files. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [token]);

  const handleDelete = async (fileKey) => {
    // A simple modal confirmation
    if (!window.confirm(`Are you sure you want to delete ${fileKey}? This action cannot be undone.`)) return;
    
    try {
        await axios.post('/.netlify/functions/delete-file', { fileKey }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(files.filter(f => f.key !== fileKey));
    } catch (err) {
        alert('Failed to delete file.');
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">VoD Review Queue</h1>
        <p className="text-muted-foreground">Browse, review, and manage all uploaded student VoDs.</p>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">File Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Size</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Uploaded On</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr><td colSpan="4" className="p-4 text-center text-muted-foreground">Loading files...</td></tr>
                ) : error ? (
                  <tr><td colSpan="4" className="p-4 text-center text-red-500">{error}</td></tr>
                ) : files.length > 0 ? (
                  files.map(file => (
                    <tr key={file.key} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{file.key}</td>
                      <td className="p-4 align-middle text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                      <td className="p-4 align-middle text-muted-foreground">{new Date(file.lastModified).toLocaleDateString()}</td>
                      <td className="p-4 align-middle text-right space-x-2">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium">
                          View
                        </a>
                        <button onClick={() => handleDelete(file.key)} className="h-9 px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-4 text-center text-muted-foreground">No files have been uploaded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoachDashboard;
