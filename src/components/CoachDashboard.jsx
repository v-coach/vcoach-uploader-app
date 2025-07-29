import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

// --- Reusable Modal Components ---

const NotificationModal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-8 max-w-md w-full text-center">
      <p className="text-white text-lg mb-6">{message}</p>
      <button onClick={onClose} className="h-10 px-6 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold">
        OK
      </button>
    </div>
  </div>
);

const ConfirmationModal = ({ onConfirm, onCancel, fileName }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-8 max-w-md w-full">
      <h2 className="text-xl font-bold text-white mb-2">Confirm Deletion</h2>
      <p className="text-white/80 mb-6">Are you sure you want to delete the file <span className="font-semibold text-white">{fileName}</span>? This action cannot be undone.</p>
      <div className="flex justify-end space-x-4">
        <button onClick={onCancel} className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium">
          Cancel
        </button>
        <button onClick={onConfirm} className="h-10 px-5 bg-red-600 text-white hover:bg-red-700 rounded-md text-sm font-medium">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const RenameModal = ({ onConfirm, onCancel, initialName }) => {
  const [newName, setNewName] = useState(initialName);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(newName);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Rename File</h2>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          autoFocus
        />
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onCancel} className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium">
            Cancel
          </button>
          <button type="submit" className="h-10 px-5 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold">
            Rename
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Info Card Component ---
const InfoCard = ({ icon, title, value, subtitle, color = "sky" }) => {
  const colorClasses = {
    sky: "border-sky-500/30 bg-sky-500/10",
    green: "border-green-500/30 bg-green-500/10", 
    purple: "border-purple-500/30 bg-purple-500/10",
    orange: "border-orange-500/30 bg-orange-500/10",
    red: "border-red-500/30 bg-red-500/10"
  };

  const iconColorClasses = {
    sky: "text-sky-400",
    green: "text-green-400",
    purple: "text-purple-400", 
    orange: "text-orange-400",
    red: "text-red-400"
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

// --- Updated Video Player Modal ---
const VideoPlayerModal = ({ videoFile, initialNotes, onSave, onClose }) => {
  const videoRef = useRef(null);
  const modalRef = useRef(null);
  const [notes, setNotes] = useState(initialNotes || []);
  const [newNoteText, setNewNoteText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddNote = () => {
    if (newNoteText.trim() === '') return;
    const currentTime = videoRef.current.currentTime;
    const newNote = {
      timestamp: currentTime,
      timeFormatted: formatTime(currentTime),
      text: newNoteText,
    };
    setNotes([...notes, newNote].sort((a, b) => a.timestamp - b.timestamp));
    setNewNoteText('');
  };

  const handleDeleteNote = (timestamp) => {
    setNotes(notes.filter(note => note.timestamp !== timestamp));
  };

  const handleNoteClick = (timestamp) => {
    videoRef.current.currentTime = timestamp;
    videoRef.current.play();
  };
  
  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
        modalRef.current?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };

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
    <div ref={modalRef} className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`} onClick={onClose}>
      <div className={`rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl w-full flex ${isFullscreen ? 'max-w-none h-full rounded-none' : 'max-w-6xl h-[90vh]'}`} onClick={(e) => e.stopPropagation()}>
        {/* Video Player Section */}
        <div className="flex-grow flex flex-col">
          <video ref={videoRef} src={videoFile.url} controls className={`w-full h-full object-contain bg-black ${isFullscreen ? 'rounded-none' : 'rounded-tl-lg'}`} />
          <div className={`p-4 bg-gray-900/80 backdrop-blur-sm flex items-center justify-between space-x-4 text-white ${isFullscreen ? 'rounded-none' : 'rounded-bl-lg'}`}>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleSeek(-10)} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-sm font-semibold">-10s</button>
              <button onClick={() => handleSeek(-5)} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-sm font-semibold">-5s</button>
              <button onClick={handlePlayPause} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-sm font-semibold">Play/Pause</button>
              <button onClick={() => handleSeek(5)} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-sm font-semibold">+5s</button>
              <button onClick={() => handleSeek(10)} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-sm font-semibold">+10s</button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold">Speed:</span>
              <button onClick={() => handlePlaybackSpeed(0.5)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">0.5x</button>
              <button onClick={() => handlePlaybackSpeed(1)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">1x</button>
              <button onClick={() => handlePlaybackSpeed(1.5)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">1.5x</button>
              <button onClick={() => handlePlaybackSpeed(2)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">2x</button>
              <button onClick={() => handlePlaybackSpeed(5)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">5x</button>
              <button onClick={() => handlePlaybackSpeed(10)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">10x</button>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={handleToggleFullScreen} className="px-3 py-1 bg-white/10 rounded">Fullscreen</button>
                <button onClick={onClose} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold">Close</button>
            </div>
          </div>
        </div>

        {/* Notes Sidebar Section */}
        <div className={`w-96 bg-transparent border-l border-white/20 flex flex-col ${isFullscreen ? 'rounded-none' : 'rounded-r-lg'}`}>
          <h3 className="text-lg font-bold p-4 border-b border-white/20 text-white">VoD Review Notes</h3>
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {notes.map((note, index) => (
              <div key={index} className="p-2 rounded-md bg-white/5 group">
                <div onClick={() => handleNoteClick(note.timestamp)} className="cursor-pointer">
                  <span className="font-bold text-sky-400">{note.timeFormatted}</span>
                  <p className="text-sm text-white/90">{note.text}</p>
                </div>
                <button onClick={() => handleDeleteNote(note.timestamp)} className="text-red-500 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/20 space-y-2">
            <textarea 
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a note at the current timestamp..."
              className="w-full h-24 p-2 rounded-md border border-white/20 bg-transparent text-white text-sm placeholder-white/50"
            />
            <button onClick={handleAddNote} className="w-full h-10 bg-sky-500 hover:bg-sky-600 rounded-md text-sm font-bold text-white">Add Note</button>
            <button onClick={() => onSave(videoFile.key, notes)} className="w-full h-10 bg-green-600 hover:bg-green-700 rounded-md text-sm font-bold text-white">Save Notes to R2</button>
          </div>
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
  const [modalState, setModalState] = useState({ type: null, fileKey: null, message: '' });
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    totalDuration: 0,
    filesWithNotes: 0,
    avgFileSize: 0
  });
  const { token } = useAuth();

  // Helper function to estimate video duration (rough estimate based on file size)
  const estimateVideoDuration = (sizeInBytes) => {
    // Rough estimate: assume 1MB per minute for compressed video
    return Math.round(sizeInBytes / (1024 * 1024));
  };

  // Helper function to format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  const calculateStats = (fileList) => {
    const totalFiles = fileList.length;
    const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    const totalDuration = fileList.reduce((sum, file) => sum + estimateVideoDuration(file.size), 0);
    const filesWithNotes = fileList.filter(file => file.hasNotes).length;
    const avgFileSize = totalFiles > 0 ? totalSize / totalFiles : 0;

    setStats({
      totalFiles,
      totalSize,
      totalDuration,
      filesWithNotes,
      avgFileSize
    });
  };

  const fetchFiles = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get('/.netlify/functions/list-files', { headers: { Authorization: `Bearer ${token}` } });
      const sortedFiles = res.data.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      setFiles(sortedFiles);
      calculateStats(sortedFiles);
    } catch (err) {
      setError('Failed to fetch files. Please check the function logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  const handleSaveNotes = async (fileKey, notes) => {
    try {
        await axios.post('/.netlify/functions/save-notes', { fileKey, notes }, { headers: { Authorization: `Bearer ${token}` } });
        setModalState({ type: 'notification', message: 'Notes saved successfully to R2!' });
        fetchFiles(); // Refresh the file list to show the new "Notes" button
        setSelectedVideo(null);
    } catch (err) {
        setModalState({ type: 'notification', message: 'Failed to save notes.' });
    }
  };

  const handleDownloadNotes = async (fileKey) => {
    try {
      const res = await axios.get(`/.netlify/functions/get-notes?fileKey=${fileKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notes = res.data;
      if (!notes || notes.length === 0) return;

      const fileContent = notes.map(note => `[${note.timeFormatted}] - ${note.text}`).join('\n');
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileKey}-notes.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download notes.');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
        await axios.post('/.netlify/functions/delete-file', { fileKey: modalState.fileKey }, { headers: { Authorization: `Bearer ${token}` } });
        const updatedFiles = files.filter(f => f.key !== modalState.fileKey);
        setFiles(updatedFiles);
        calculateStats(updatedFiles);
        setModalState({ type: null, fileKey: null });
    } catch (err) {
        setModalState({ type: 'notification', message: 'Failed to delete file.' });
    }
  };

  const handleRename = async (newName) => {
    if (newName && newName !== modalState.fileKey) {
        try {
            await axios.post('/.netlify/functions/rename-file', { oldKey: modalState.fileKey, newKey: newName }, { headers: { Authorization: `Bearer ${token}` } });
            setModalState({ type: null, fileKey: null });
            fetchFiles();
        } catch (err) {
            setModalState({ type: 'notification', message: 'Failed to rename file.' });
        }
    } else {
      setModalState({ type: null, fileKey: null });
    }
  };

  return (
    <>
      {selectedVideo && <VideoPlayerModal videoFile={selectedVideo} onSave={handleSaveNotes} onClose={() => setSelectedVideo(null)} />}
      {modalState.type === 'notification' && (
        <NotificationModal 
          message={modalState.message}
          onClose={() => setModalState({ type: null, fileKey: null, message: '' })}
        />
      )}
      {modalState.type === 'delete' && (
        <ConfirmationModal 
          fileName={modalState.fileKey}
          onConfirm={handleDelete}
          onCancel={() => setModalState({ type: null, fileKey: null })}
        />
      )}
      {modalState.type === 'rename' && (
        <RenameModal 
          initialName={modalState.fileKey}
          onConfirm={handleRename}
          onCancel={() => setModalState({ type: null, fileKey: null })}
        />
      )}

      <div className="flex flex-col space-y-4">
        {/* Header Section */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">VoD Review Queue</h1>
          <p className="text-white/80 mt-1">Browse, review, and manage all uploaded student VoDs with detailed analytics.</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <InfoCard 
            icon="📹"
            title="Total Uploads"
            value={stats.totalFiles.toLocaleString()}
            subtitle="VoD files"
            color="sky"
          />
          <InfoCard 
            icon="💾"
            title="Storage Used"
            value={formatFileSize(stats.totalSize)}
            subtitle={`Avg: ${formatFileSize(stats.avgFileSize)}`}
            color="purple"
          />
          <InfoCard 
            icon="⏱️"
            title="Video Content"
            value={formatDuration(stats.totalDuration)}
            subtitle="Estimated duration"
            color="green"
          />
          <InfoCard 
            icon="📝"
            title="Reviewed"
            value={stats.filesWithNotes}
            subtitle={`${stats.totalFiles > 0 ? Math.round((stats.filesWithNotes / stats.totalFiles) * 100) : 0}% analyzed`}
            color="orange"
          />
          <InfoCard 
            icon="⏳"
            title="Pending Review"
            value={stats.totalFiles - stats.filesWithNotes}
            subtitle="Awaiting analysis"
            color="red"
          />
        </div>

        {/* Files Table */}
        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl flex-1 min-h-0">
          <div className="p-0 flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b border-white/20">
                  <tr className="transition-colors">
                    <th className="h-10 px-3 text-left align-middle font-medium text-white/60">File Name</th>
                    <th className="h-10 px-3 text-left align-middle font-medium text-white/60">Size</th>
                    <th className="h-10 px-3 text-left align-middle font-medium text-white/60">Est. Duration</th>
                    <th className="h-10 px-3 text-left align-middle font-medium text-white/60">Uploaded On</th>
                    <th className="h-10 px-3 text-left align-middle font-medium text-white/60">Status</th>
                    <th className="h-10 px-3 text-right align-middle font-medium text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {loading ? (
                    <tr><td colSpan="6" className="p-6 text-center text-white/60">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                        <span>Loading files...</span>
                      </div>
                    </td></tr>
                  ) : error ? (
                    <tr><td colSpan="6" className="p-6 text-center text-red-400">{error}</td></tr>
                  ) : files.length > 0 ? (
                    files.map(file => (
                      <tr key={file.key} className="border-b border-white/20 transition-colors hover:bg-white/5">
                        <td className="p-3 align-middle font-medium text-white">{file.key}</td>
                        <td className="p-3 align-middle text-white/80">{(file.size / 1024 / 1024).toFixed(1)} MB</td>
                        <td className="p-3 align-middle text-white/80">{formatDuration(estimateVideoDuration(file.size))}</td>
                        <td className="p-3 align-middle text-white/80">{new Date(file.lastModified).toLocaleDateString()}</td>
                        <td className="p-3 align-middle">
                          {file.hasNotes ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                              ✓ Reviewed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 align-middle text-right space-x-1">
                          <button onClick={() => setSelectedVideo(file)} className="h-8 px-2 bg-sky-500 text-white hover:bg-sky-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold transition-colors">
                            View
                          </button>
                          {file.hasNotes && (
                            <button onClick={() => handleDownloadNotes(file.key)} className="h-8 px-2 bg-green-600 text-white hover:bg-green-700 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold transition-colors">
                                Notes
                            </button>
                          )}
                          <button onClick={() => setModalState({ type: 'rename', fileKey: file.key })} className="h-8 px-2 bg-gray-500 text-white hover:bg-gray-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors">
                            Rename
                          </button>
                          <button onClick={() => setModalState({ type: 'delete', fileKey: file.key })} className="h-8 px-2 bg-red-600 text-white hover:bg-red-500 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="p-8 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="text-3xl">📹</div>
                        <div className="text-white/60">No VoDs have been uploaded yet</div>
                        <div className="text-white/40 text-sm">Students can upload their gameplay footage for review</div>
                      </div>
                    </td></tr>
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
