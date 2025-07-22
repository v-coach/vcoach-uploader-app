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
              <button onClick={() => handleSeek(-5)} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-sm font-semibold">-5s</button>
              <button onClick={handlePlayPause} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-sm font-semibold">Play/Pause</button>
              <button onClick={() => handleSeek(5)} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-sm font-semibold">+5s</button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold">Speed:</span>
              <button onClick={() => handlePlaybackSpeed(0.5)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">0.5x</button>
              <button onClick={() => handlePlaybackSpeed(1)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">1x</button>
              <button onClick={() => handlePlaybackSpeed(1.5)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">1.5x</button>
              <button onClick={() => handlePlaybackSpeed(2)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">2x</button>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={handleToggleFullScreen} className="px-3 py-1 bg-white/10 rounded">Fullscreen</button>
                <button onClick={onClose} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold">Close</button>
            </div>
          </div>
        </div>

        {/* Notes Sidebar Section */}
        <div className={`w-96 bg-transparent border-l border-white/20 flex flex-col ${isFullscreen ? 'rounded-none' : 'rounded-r-lg'}`}>
          <h3 className="text-lg font-bold p-4 border-b border-white/20">VoD Review Notes</h3>
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {notes.map((note, index) => (
              <div key={index} onClick={() => handleNoteClick(note.timestamp)} className="p-2 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer">
                <span className="font-bold text-sky-400">{note.timeFormatted}</span>
                <p className="text-sm text-white/90">{note.text}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/20 space-y-2">
            <textarea 
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a note at the current timestamp..."
              className="w-full h-24 p-2 rounded-md border border-white/20 bg-transparent text-white text-sm"
            />
            <button onClick={handleAddNote} className="w-full h-10 bg-sky-500 hover:bg-sky-600 rounded-md text-sm font-bold">Add Note</button>
            <button onClick={() => onSave(videoFile.key, notes)} className="w-full h-10 bg-green-600 hover:bg-green-700 rounded-md text-sm font-bold">Save Notes</button>
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
  const [notesByFile, setNotesByFile] = useState({});
  const { token } = useAuth();

  const fetchFiles = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get('/.netlify/functions/list-files', { headers: { Authorization: `Bearer ${token}` } });
      setFiles(res.data.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
    } catch (err) {
      setError('Failed to fetch files. Please check the function logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  const handleSaveNotes = (fileKey, notes) => {
    setNotesByFile(prev => ({ ...prev, [fileKey]: notes }));
    setModalState({ type: 'notification', message: 'Notes saved for this session!' });
    setSelectedVideo(null); // Close the video player
  };

  const handleDownloadNotes = (fileKey) => {
    const notes = notesByFile[fileKey];
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
  };

  const handleDelete = async () => {
    try {
        await axios.post('/.netlify/functions/delete-file', { fileKey: modalState.fileKey }, { headers: { Authorization: `Bearer ${token}` } });
        setFiles(files.filter(f => f.key !== modalState.fileKey));
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
      {selectedVideo && <VideoPlayerModal videoFile={selectedVideo} initialNotes={notesByFile[selectedVideo.key]} onSave={handleSaveNotes} onClose={() => setSelectedVideo(null)} />}
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
                          <button onClick={() => setSelectedVideo(file)} className="h-9 px-3 bg-sky-500 text-white hover:bg-sky-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold">
                            View
                          </button>
                          {notesByFile[file.key] && notesByFile[file.key].length > 0 && (
                            <button onClick={() => handleDownloadNotes(file.key)} className="h-9 px-3 bg-green-600 text-white hover:bg-green-700 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold">
                                Notes
                            </button>
                          )}
                          <button onClick={() => setModalState({ type: 'rename', fileKey: file.key })} className="h-9 px-3 bg-gray-500 text-white hover:bg-gray-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium">
                            Rename
                          </button>
                          <button onClick={() => setModalState({ type: 'delete', fileKey: file.key })} className="h-9 px-3 bg-red-600 text-white hover:bg-red-500 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium">
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
