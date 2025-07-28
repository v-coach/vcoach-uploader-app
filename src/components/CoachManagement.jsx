import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const CoachModal = ({ coach, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: coach?.name || '',
    title: coach?.title || '',
    description: coach?.description || '',
    skills: coach?.skills?.join(', ') || '',
    avatarColor: coach?.avatarColor || 'from-sky-400 to-blue-600',
    initials: coach?.initials || ''
  });

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
  }, [formData.name]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
    onSave({
      ...coach,
      ...formData,
      skills: skillsArray
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">
          {coach ? 'Edit Coach' : 'Add New Coach'}
        </h2>
        
        {/* Avatar Preview */}
        <div className="text-center mb-6">
          <div className={`w-20 h-20 bg-gradient-to-br ${formData.avatarColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
            <span className="text-xl font-bold text-white">
              {formData.initials || '??'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Head Coach, Mechanics Coach"
              className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of expertise and experience"
              className="w-full h-20 rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white resize-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
              placeholder="e.g., Strategy, Team Play, Leadership"
              className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Avatar Color</label>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatarColor: color.value }))}
                  className={`h-10 rounded-md ${color.preview} flex items-center justify-center text-white text-sm font-medium border-2 transition-all ${
                    formData.avatarColor === color.value ? 'border-white' : 'border-transparent'
                  }`}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Initials</label>
            <input
              type="text"
              value={formData.initials}
              onChange={(e) => setFormData(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))}
              maxLength="3"
              className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button 
            type="button" 
            onClick={onCancel} 
            className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="h-10 px-5 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold"
          >
            {coach ? 'Update Coach' : 'Add Coach'}
          </button>
        </div>
      </form>
    </div>
  );
};

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, coach: null });
  const { token } = useAuth();

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
            onClick={() => setModalState({ type: 'add', coach: null })}
            className="h-10 px-4 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold"
          >
            + Add Coach
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-white/60 py-8">Loading coaches...</div>
          ) : coaches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <div key={coach.id} className="rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${coach.avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-lg font-bold text-white">{coach.initials}</span>
                  </div>
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
