import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

// New Video Player Modal Component
const VideoPlayerModal = ({ videoUrl, onClose }) => {
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleSeek = (seconds) => {
    videoRef.current.currentTime += seconds;
  };

  const handlePlaybackSpeed = (speed) => {
    videoRef.current.playbackRate = speed;
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black rounded-lg shadow-xl w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <video ref={videoRef} src={videoUrl} controls className="w-full rounded-t-lg" />
        <div className="p-4 bg-gray-800 rounded-b-lg flex items-center justify-between space-x-4 text-white">
          <div className="flex items-center space-x-2">
            <button onClick={() => handleSeek(-5)} className="px-3 py-1 bg-white/10 rounded">-5s</button>
            <button onClick={handlePlayPause} className="px-3 py-1 bg-white/10 rounded">Play/Pause</button>
            <button onClick={() => handleSeek(5)} className="px-3 py-1 bg-white/10 rounded">+5s</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Speed:</span>
            <button onClick={() => handlePlaybackSpeed(0.5)} className="px-2 py-1 bg-white/10 rounded">0.5x</button>
            <button onClick={() => handlePlaybackSpeed(1)} className="px-2 py-1 bg-white/10 rounded">1x</button>
            <button onClick={() => handlePlaybackSpeed(1.5)} className="px-2 py-1 bg-white/10 rounded">1.5x</button>
            <button onClick={() => handlePlaybackSpeed(2)} className="px-2 py-1 bg-white/10 rounded">2x</button>
          </div>
          <button onClick={onClose} className="px-3 py-1 bg-red-600 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};


function CoachDashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/.netlify/functions/list-files');
        setFiles(res.data.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
      } catch (err) {
        setError('Failed to fetch files. Please check the function logs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleDelete = async (fileKey) => {
    if (!window.confirm(`Are you sure you want to delete ${fileKey}? This action cannot be undone.`)) return;
    
    try {
        await axios.post('/.netlify/functions/delete-file', { fileKey });
        setFiles(files.filter(f => f.key !== fileKey));
    } catch (err) {
        alert('Failed to delete file.');
    }
  };

  const handleViewClick = (url) => {
    setSelectedVideo(url);
  };

  return (
    <>
      {selectedVideo && <VideoPlayerModal videoUrl={selectedVideo} onClose={() => setSelectedVideo(null)} />}
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
                          <button onClick={() => handleViewClick(file.url)} className="h-9 px-3 bg-sky-500 text-white hover:bg-sky-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold">
                            View
                          </button>
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
    </>
  );
}

export default CoachDashboard;
