import React, { useEffect, useState } from 'react';

const Admin = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/uploads.json');
      const data = await res.json();
      setFiles(data.reverse()); // Most recent first
    } catch (err) {
      console.error('Error fetching uploads.json:', err);
    }
    setLoading(false);
  };

  const deleteFile = async (key) => {
    if (!window.confirm(`Delete ${key}?`)) return;

    await fetch(`/.netlify/functions/delete-file?key=${encodeURIComponent(key)}`);
    await fetchUploads(); // refresh list
  };

  const generateLink = async (key) => {
    const res = await fetch(`/.netlify/functions/generate-link?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    navigator.clipboard.writeText(data.url);
    alert('Link copied to clipboard!');
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📂 Admin Panel</h1>
      {files.length === 0 ? (
        <p>No uploaded files.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">File</th>
              <th className="p-2 text-left">Uploader</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Size</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{file.filename}</td>
                <td className="p-2">{file.uploadedBy}</td>
                <td className="p-2">{new Date(file.uploadedAt).toLocaleString()}</td>
                <td className="p-2">{(file.size / 1024).toFixed(1)} KB</td>
                <td className="p-2 space-x-2 text-center">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => generateLink(file.filename)}
                  >
                    Share
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteFile(file.filename)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;
