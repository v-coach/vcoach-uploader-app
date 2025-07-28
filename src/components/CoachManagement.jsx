import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

// Replace the CoachModal component with this highly visible version:

const CoachModal = ({ coach, onSave, onCancel }) => {
  console.log("=== COACH MODAL LOADING ===", { coach, onSave: !!onSave, onCancel: !!onCancel });
  
  const [formData, setFormData] = useState({
    name: coach?.name || '',
    title: coach?.title || '',
    description: coach?.description || '',
    skills: coach?.skills?.join(', ') || '',
    avatarColor: coach?.avatarColor || 'from-sky-400 to-blue-600',
    initials: coach?.initials || '',
    profileImage: coach?.profileImage || null,
    socialMedia: {
      twitter: coach?.socialMedia?.twitter || '',
      instagram: coach?.socialMedia?.instagram || '',
      youtube: coach?.socialMedia?.youtube || '',
      twitch: coach?.socialMedia?.twitch || '',
      discord: coach?.socialMedia?.discord || ''
    }
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(coach?.profileImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { token } = useAuth();

  const colorOptions = [
    { value: 'from-sky-400 to-blue-600', label: 'Blue', preview: 'bg-gradient-to-br from-sky-400 to-blue-600' },
    { value: 'from-green-400 to-emerald-600', label: 'Green', preview: 'bg-gradient-to-br from-green-400 to-emerald-600' },
    { value: 'from-purple-400 to-violet-600', label: 'Purple', preview: 'bg-gradient-to-br from-purple-400 to-violet-600' },
    { value: 'from-red-400 to-rose-600', label: 'Red', preview: 'bg-gradient-to-br from-red-400 to-rose-600' },
    { value: 'from-orange-400 to-amber-600', label: 'Orange', preview: 'bg-gradient-to-br from-orange-400 to-amber-600' },
    { value: 'from-pink-400 to-fuchsia-600', label: 'Pink', preview: 'bg-gradient-to-br from-pink-400 to-fuchsia-600' }
  ];

  useEffect(() => {
    if (!formData.initials && formData.name) {
      setFormData(prev => ({
        ...prev,
        initials: formData.name.split(' ').map(n => n[0]).join('').toUpperCase()
      }));
    }
  }, [formData.name, formData.initials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== FORM SUBMIT ===", formData);
    
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
    onSave({
      ...coach,
      ...formData,
      skills: skillsArray,
      profileImage: formData.profileImage
    });
  };

  // Force modal to be visible with very high z-index and solid background
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Solid dark background
        zIndex: 999999, // Very high z-index
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        console.log("=== BACKDROP CLICKED ===");
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: '#1a1a1a', // Solid dark background
          border: '2px solid #ffffff',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: 'white'
        }}
        onClick={(e) => {
          console.log("=== MODAL CONTENT CLICKED ===");
          e.stopPropagation();
        }}
      >
        {/* Very visible header */}
        <div style={{
          backgroundColor: '#00ff00',
          color: '#000000',
          padding: '16px',
          margin: '-32px -32px 24px -32px',
          borderRadius: '10px 10px 0 0',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🎉 MODAL IS WORKING! 🎉<br/>
          {coach ? `Edit: ${coach.name}` : 'Add New Coach'}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Coach Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                border: '2px solid #666',
                borderRadius: '6px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="Enter coach name"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                border: '2px solid #666',
                borderRadius: '6px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="e.g., Head Coach, Mechanics Coach"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                border: '2px solid #666',
                borderRadius: '6px',
                color: 'white',
                fontSize: '16px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Brief description of expertise and experience"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                border: '2px solid #666',
                borderRadius: '6px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="e.g., Strategy, Team Play, Leadership"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Initials
            </label>
            <input
              type="text"
              value={formData.initials}
              onChange={(e) => setFormData(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                border: '2px solid #666',
                borderRadius: '6px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="e.g., JD"
              maxLength="3"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => {
                console.log("=== CANCEL CLICKED ===");
                onCancel();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                padding: '12px 24px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {coach ? 'Update Coach' : 'Add Coach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, coach: null });
  const { token } = useAuth();

  console.log("=== COACH MANAGEMENT RENDER ===");
  console.log("Modal state:", modalState);
  console.log("Has token:", !!token);

  const fetchCoaches = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get('/.netlify/functions/manage-coaches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoaches(res.data);
    } catch (err) {
      console.error('Failed to fetch coaches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, [token]);

  const handleSaveCoach = async (coachData) => {
    try {
      if (coachData.id) {
        // Update existing coach
        await axios.put('/.netlify/functions/manage-coaches', coachData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new coach
        await axios.post('/.netlify/functions/manage-coaches', coachData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setModalState({ type: null, coach: null });
      fetchCoaches();
    } catch (err) {
      alert('Failed to save coach.');
      console.error(err);
    }
  };

  const handleDeleteCoach = async (coach) => {
    if (window.confirm(`Are you sure you want to delete ${coach.name}?`)) {
      try {
        await axios.delete('/.netlify/functions/manage-coaches', {
          headers: { Authorization: `Bearer ${token}` },
          data: { id: coach.id }
        });
        fetchCoaches();
      } catch (err) {
        alert('Failed to delete coach.');
        console.error(err);
      }
    }
  };

  const getSkillColor = (avatarColor) => {
    if (avatarColor.includes('sky') || avatarColor.includes('blue')) return 'bg-sky-500/20 text-sky-300';
    if (avatarColor.includes('green') || avatarColor.includes('emerald')) return 'bg-green-500/20 text-green-300';
    if (avatarColor.includes('purple') || avatarColor.includes('violet')) return 'bg-purple-500/20 text-purple-300';
    if (avatarColor.includes('red') || avatarColor.includes('rose')) return 'bg-red-500/20 text-red-300';
    if (avatarColor.includes('orange') || avatarColor.includes('amber')) return 'bg-orange-500/20 text-orange-300';
    if (avatarColor.includes('pink') || avatarColor.includes('fuchsia')) return 'bg-pink-500/20 text-pink-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  return (
    <>
      {modalState.type && (
        <CoachModal
          coach={modalState.coach}
          onSave={handleSaveCoach}
          onCancel={() => setModalState({ type: null, coach: null })}
        />
      )}

      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl">
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Coach Management</h2>
          <button
            onClick={() => {
              console.log("=== ADD COACH BUTTON CLICKED ===");
              alert("Button clicked! Check console for more info.");
              setModalState({ type: 'add', coach: null });
              console.log("Modal state set to:", { type: 'add', coach: null });
            }}
            className="h-10 px-4 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold"
          >
            + Add Coach
          </button>
        </div>

        <div className="p-6">
          {/* Debug info */}
          <div className="mb-4 p-3 bg-gray-800/50 rounded text-sm text-white">
            <strong>Debug:</strong> Modal Type: {modalState.type || 'null'} | 
            Token: {token ? 'Present' : 'Missing'} | 
            Coaches: {coaches.length}
          </div>

          {loading ? (
            <div className="text-center text-white/60 py-8">Loading coaches...</div>
          ) : coaches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <div key={coach.id} className="rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6 text-center">
                  {coach.profileImage ? (
                    <img 
                      src={coach.profileImage}
                      alt={coach.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/20 mx-auto mb-4"
                    />
                  ) : (
                    <div className={`w-16 h-16 bg-gradient-to-br ${coach.avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-lg font-bold text-white">{coach.initials}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white mb-1">{coach.name}</h3>
                  <div className="text-sky-400 font-semibold mb-3 text-sm">{coach.title}</div>
                  <p className="text-white/70 text-xs mb-4 leading-relaxed">{coach.description}</p>
                  
                  {coach.skills && coach.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {coach.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${getSkillColor(coach.avatarColor)}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setModalState({ type: 'edit', coach })}
                      className="h-8 px-3 bg-gray-500 text-white hover:bg-gray-600 rounded-md text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCoach(coach)}
                      className="h-8 px-3 bg-red-600 text-white hover:bg-red-500 rounded-md text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">
              No coaches added yet. Click "Add Coach" to get started.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoachManagement;
