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
        <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">VoD Review Queue</h1>
        <p className="text-white/80 mt-2">Browse, review, and manage all uploaded student VoDs.</p>
      </div>
      
      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b border-white/20">
                <tr className="transition-colors">
                  <th className="h-12 px-4 text-left align-middle font-medium text-white/60">File Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-white/60">Size</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-white/60">Uploaded On</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-white/60">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr><td colSpan="4" className="p-4 text-center text-white/60">Loading files...</td></tr>
                ) : error ? (
                  <tr><td colSpan="4" className="p-4 text-center text-red-400">{error}</td></tr>
                ) : files.length > 0 ? (
                  files.map(file => (
                    <tr key={file.key} className="border-b border-white/20 transition-colors hover:bg-white/5">
                      <td className="p-4 align-middle font-medium text-white">{file.key}</td>
                      <td className="p-4 align-middle text-white/80">{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                      <td className="p-4 align-middle text-white/80">{new Date(file.lastModified).toLocaleDateString()}</td>
                      <td className="p-4 align-middle text-right space-x-2">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="h-9 px-3 bg-white text-gray-900 hover:bg-gray-200 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold">
                          View
                        </a>
                        <button onClick={() => handleDelete(file.key)} className="h-9 px-3 bg-red-600 text-white hover:bg-red-500 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-4 text-center text-white/60">No files have been uploaded yet.</td></tr>
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
