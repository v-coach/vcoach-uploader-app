import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

function CoachDashboard() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      if (!token) return;
      try {
        const res = await axios.get('/.netlify/functions/list-files', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(res.data);
      } catch (err) {
        setError('Failed to fetch files.');
        console.error(err);
      }
    };
    fetchFiles();
  }, [token]);

  const handleDelete = async (fileKey) => {
    if (!window.confirm(`Are you sure you want to delete ${fileKey}?`)) return;
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
    <div>
      <h1 className="text-4xl font-bold mb-6 text-center">Coach Dashboard</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">File Name</th>
              <th className="p-2">Size</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.key} className="border-t border-gray-700">
                <td className="p-2">{file.key}</td>
                <td className="p-2">{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                <td className="p-2 space-x-2">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">View</a>
                  <button onClick={() => handleDelete(file.key)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CoachDashboard;
