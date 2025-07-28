import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const CoachModal = ({ coach, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: coach?.name || '',
    title: coach?.title || '',
    description: coach?.description || '',
    skills: coach?.skills?.join(', ') || '',
    avatarColor: coach?.avatarColor || coach?.avatar_color || 'from-sky-400 to-blue-600',
    profileImage: coach?.profileImage || coach?.profile_image || null,
    socialMedia: {
      twitter: coach?.socialMedia?.twitter || coach?.twitter_url || '',
      instagram: coach?.socialMedia?.instagram || coach?.instagram_url || '',
      youtube: coach?.socialMedia?.youtube || coach?.youtube_url || '',
      twitch: coach?.socialMedia?.twitch || coach?.twitch_url || '',
      discord: coach?.socialMedia?.discord || coach?.discord_url || ''
    }
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(coach?.profileImage || coach?.profile_image || null);
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

  // Auto-generate initials from name
  const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    // Use existing coach ID or create a temporary one
    const coachId = coach?.id || `temp-${Date.now()}`;

    setUploadingImage(true);
    try {
      console.log("Starting image upload for coach:", coachId);
      console.log("Image file:", imageFile.name, imageFile.type, imageFile.size);
      
      // Get pre-signed URL for image upload
      const response = await fetch('/.netlify/functions/upload-coach-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: imageFile.name,
          contentType: imageFile.type,
          coachId: coachId
        })
      });

      console.log("Upload URL response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload URL error:", errorText);
        throw new Error(`Failed to get upload URL: ${response.status} ${errorText}`);
      }

      const uploadData = await response.json();
      console.log("Upload response data:", uploadData);
      
      const { uploadURL, publicUrl } = uploadData;
      console.log("Got upload URL, uploading file...");
      console.log("Public URL will be:", publicUrl);

      // Upload the file
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: imageFile,
        headers: {
          'Content-Type': imageFile.type
        }
      });

      console.log("File upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("File upload error:", errorText);
        throw new Error(`Failed to upload image: ${uploadResponse.status}`);
      }

      console.log("Image uploaded successfully to:", publicUrl);
      
      // Test if the image URL is accessible
      const testImg = new Image();
      testImg.onload = () => console.log("✅ Image URL is accessible:", publicUrl);
      testImg.onerror = () => console.error("❌ Image URL is not accessible:", publicUrl);
      testImg.src = publicUrl;
      
      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(`Failed to upload image: ${error.message}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let profileImageUrl = formData.profileImage;
    
    // Upload new image if one was selected
    if (imageFile) {
      console.log("Uploading image before saving coach...");
      profileImageUrl = await uploadImage();
      if (!profileImageUrl) {
        console.log("Image upload failed, not saving coach");
        return; // Upload failed
      }
    }
    
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
    
    // Structure data to match both old and new coach formats
    const coachData = {
      ...coach,
      id: coach?.id,
      name: formData.name,
      title: formData.title,
      description: formData.description, // Preserve spaces and formatting
      skills: skillsArray,
      profileImage: profileImageUrl,
      profile_image: profileImageUrl, // Support both formats
      avatarColor: formData.avatarColor,
      avatar_color: formData.avatarColor, // Support both formats
      initials: initials,
      socialMedia: formData.socialMedia,
      // Also include individual social media fields for backward compatibility
      twitter_url: formData.socialMedia.twitter,
      instagram_url: formData.socialMedia.instagram,
      youtube_url: formData.socialMedia.youtube,
      twitch_url: formData.socialMedia.twitch,
      discord_url: formData.socialMedia.discord
    };
    
    console.log("Saving coach with data:", coachData);
    onSave(coachData);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, profileImage: null }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-white mb-6">
            {coach ? 'Edit Coach' : 'Add New Coach'}
          </h2>
          
          {/* Avatar/Image Preview */}
          <div className="text-center mb-6">
            {imagePreview || formData.profileImage ? (
              <div className="relative w-20 h-20 mx-auto mb-2">
                <img 
                  src={imagePreview || formData.profileImage}
                  alt="Coach profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                  onError={(e) => {
                    console.error("Image failed to load:", e.target.src);
                    removeImage();
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={`w-20 h-20 bg-gradient-to-br ${formData.avatarColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="text-xl font-bold text-white">
                  {initials}
                </span>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="cursor-pointer h-8 px-3 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-medium inline-flex items-center transition-colors">
                {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                />
              </label>
              <p className="text-xs text-white/60">JPEG, PNG, WebP, GIF (max 5MB)</p>
              {imageFile && (
                <p className="text-xs text-green-400">
                  📁 {imageFile.name} ready to upload
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="coach-name" className="text-sm font-medium text-white/80 block mb-2">Name</label>
              <input
                id="coach-name"
                name="coach-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Enter coach name"
                required
              />
            </div>

            <div>
              <label htmlFor="coach-title" className="text-sm font-medium text-white/80 block mb-2">Title</label>
              <input
                id="coach-title"
                name="coach-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Head Coach, Mechanics Coach"
                className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="coach-description" className="text-sm font-medium text-white/80 block mb-2">Description</label>
              <textarea
                id="coach-description"
                name="coach-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of expertise and experience (spaces will be preserved)"
                className="w-full h-20 rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-white/50 mt-1">Tip: Line breaks and spaces will be preserved in the final display</p>
            </div>

            <div>
              <label htmlFor="coach-skills" className="text-sm font-medium text-white/80 block mb-2">Skills (comma-separated)</label>
              <input
                id="coach-skills"
                name="coach-skills"
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., Strategy, Team Play, Leadership"
                className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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

            {/* Social Media Section */}
            <div>
              <label className="text-sm font-medium text-white/80 block mb-3">Social Media Links</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <input
                    id="twitter-url"
                    name="twitter-url"
                    type="url"
                    placeholder="https://twitter.com/username"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                    }))}
                    className="flex-1 h-8 rounded-md border border-white/20 bg-transparent px-2 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                    </svg>
                  </div>
                  <input
                    id="instagram-url"
                    name="instagram-url"
                    type="url"
                    placeholder="https://instagram.com/username"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                    className="flex-1 h-8 rounded-md border border-white/20 bg-transparent px-2 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <input
                    id="youtube-url"
                    name="youtube-url"
                    type="url"
                    placeholder="https://youtube.com/@username"
                    value={formData.socialMedia.youtube}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, youtube: e.target.value }
                    }))}
                    className="flex-1 h-8 rounded-md border border-white/20 bg-transparent px-2 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.571 4.714h.857c2.329 0 4.429 1.143 4.429 2.571v9.43c0 1.427-2.1 2.571-4.429 2.571h-.857C9.243 19.286 7.143 18.143 7.143 16.715V7.285C7.143 5.857 9.243 4.714 11.571 4.714z"/>
                    </svg>
                  </div>
                  <input
                    id="twitch-url"
                    name="twitch-url"
                    type="url"
                    placeholder="https://twitch.tv/username"
                    value={formData.socialMedia.twitch}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, twitch: e.target.value }
                    }))}
                    className="flex-1 h-8 rounded-md border border-white/20 bg-transparent px-2 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <input
                    id="discord-url"
                    name="discord-url"
                    type="text"
                    placeholder="username#1234 or discord.gg/invite"
                    value={formData.socialMedia.discord}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, discord: e.target.value }
                    }))}
                    className="flex-1 h-8 rounded-md border border-white/20 bg-transparent px-2 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button 
              type="button" 
              onClick={onCancel}
              className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={uploadingImage}
              className="h-10 px-5 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploadingImage ? 'Uploading Image...' : (coach ? 'Update Coach' : 'Add Coach')}
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
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ type: null, coach: null });
  const { token } = useAuth();

  const fetchCoaches = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching coaches with token:', token.substring(0, 10) + '...');
      
      const res = await axios.get('/.netlify/functions/manage-coaches', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Coaches fetched successfully:', res.data);
      setCoaches(res.data || []);
    } catch (err) {
      console.error('Failed to fetch coaches:', err);
      setError(`Failed to fetch coaches: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, [token]);

  const handleSaveCoach = async (coachData) => {
    try {
      console.log('Saving coach data:', coachData);
      
      if (coachData.id) {
        // Update existing coach
        const response = await axios.put('/.netlify/functions/manage-coaches', coachData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Coach updated successfully:', response.data);
      } else {
        // Create new coach
        const response = await axios.post('/.netlify/functions/manage-coaches', coachData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Coach created successfully:', response.data);
      }
      
      setModalState({ type: null, coach: null });
      await fetchCoaches(); // Refresh the list
    } catch (err) {
      console.error('Failed to save coach:', err);
      const errorMessage = err.response?.data?.error || err.message;
      alert(`Failed to save coach: ${errorMessage}`);
    }
  };

  const handleDeleteCoach = async (coach) => {
    if (window.confirm(`Are you sure you want to delete ${coach.name}?`)) {
      try {
        await axios.delete('/.netlify/functions/manage-coaches', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { id: coach.id }
        });
        await fetchCoaches(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete coach:', err);
        const errorMessage = err.response?.data?.error || err.message;
        alert(`Failed to delete coach: ${errorMessage}`);
      }
    }
  };

  const getSkillColor = (avatarColor) => {
    if (!avatarColor) return 'bg-gray-500/20 text-gray-300';
    
    if (avatarColor.includes('sky') || avatarColor.includes('blue')) return 'bg-sky-500/20 text-sky-300';
    if (avatarColor.includes('green') || avatarColor.includes('emerald')) return 'bg-green-500/20 text-green-300';
    if (avatarColor.includes('purple') || avatarColor.includes('violet')) return 'bg-purple-500/20 text-purple-300';
    if (avatarColor.includes('red') || avatarColor.includes('rose')) return 'bg-red-500/20 text-red-300';
    if (avatarColor.includes('orange') || avatarColor.includes('amber')) return 'bg-orange-500/20 text-orange-300';
    if (avatarColor.includes('pink') || avatarColor.includes('fuchsia')) return 'bg-pink-500/20 text-pink-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  // Helper function to render description with preserved formatting
  const renderDescription = (description) => {
    if (!description) return '';
    
    // Split by line breaks and render each line as a paragraph
    return description.split('\n').map((line, index) => {
      if (line.trim() === '') return null; // Skip empty lines
      return (
        <span key={index}>
          {line}
          {index < description.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  if (!token) {
    return (
      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-6">
        <div className="text-center text-red-400">Please log in to manage coaches.</div>
      </div>
    );
  }

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
            className="h-10 px-4 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold transition-colors"
          >
            + Add Coach
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
              <button 
                onClick={fetchCoaches}
                className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center text-white/60 py-8">Loading coaches...</div>
          ) : coaches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => {
                // Support both old and new coach data formats
                const profileImage = coach.profileImage || coach.profile_image;
                const avatarColor = coach.avatarColor || coach.avatar_color || 'from-sky-400 to-blue-600';
                const socialMedia = coach.socialMedia || {
                  twitter: coach.twitter_url,
                  instagram: coach.instagram_url,
                  youtube: coach.youtube_url,
                  twitch: coach.twitch_url,
                  discord: coach.discord_url
                };
                
                console.log('Coach image URL:', profileImage); // Debug log
                
                // Check if it's an old invalid URL format
                const isOldUrl = profileImage && profileImage.includes('.r2.cloudflarestorage.com');
                
                return (
                  <div key={coach.id} className="rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6 text-center">
                    {profileImage && !isOldUrl ? (
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <img 
                          src={profileImage}
                          alt={coach.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                          onLoad={() => console.log('Image loaded successfully:', profileImage)}
                          onError={(e) => {
                            console.error("Coach image failed to load:", profileImage);
                            console.error("Error event:", e);
                            // Hide the broken image and show avatar instead
                            e.currentTarget.style.display = 'none';
                            const avatarDiv = e.currentTarget.parentElement?.nextElementSibling;
                            if (avatarDiv) {
                              avatarDiv.style.display = 'flex';
                            }
                          }}
                        />
                        {/* Fallback avatar - initially hidden */}
                        <div 
                          className={`w-16 h-16 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center absolute top-0 left-0`}
                          style={{ display: 'none' }}
                        >
                          <span className="text-lg font-bold text-white">
                            {coach.initials || coach.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={`w-16 h-16 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className="text-lg font-bold text-white">
                          {coach.initials || coach.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                        {isOldUrl && (
                          <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                            ⚠️
                          </div>
                        )}
                      </div>
                    )}
                    
                    <h3 className="text-lg font-bold text-white mb-1">{coach.name}</h3>
                    <div className="text-sky-400 font-semibold mb-3 text-sm">{coach.title}</div>
                    
                    {coach.description && (
                      <div className="text-white/70 text-xs mb-4 leading-relaxed">
                        {renderDescription(coach.description)}
                      </div>
                    )}
                    
                    {coach.skills && coach.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mb-4">
                        {coach.skills.map((skill, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs ${getSkillColor(avatarColor)}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Social Media Links */}
                    {socialMedia && Object.values(socialMedia).some(link => link) && (
                      <div className="flex justify-center space-x-2 mb-4">
                        {socialMedia.twitter && (
                          <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                        )}
                        {socialMedia.instagram && (
                          <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                            </svg>
                          </a>
                        )}
                        {socialMedia.youtube && (
                          <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </a>
                        )}
                        {socialMedia.twitch && (
                          <a href={socialMedia.twitch} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.571 4.714h.857c2.329 0 4.429 1.143 4.429 2.571v9.43c0 1.427-2.1 2.571-4.429 2.571h-.857C9.243 19.286 7.143 18.143 7.143 16.715V7.285C7.143 5.857 9.243 4.714 11.571 4.714z"/>
                            </svg>
                          </a>
                        )}
                        {socialMedia.discord && (
                          <a 
                            href={socialMedia.discord.startsWith('http') ? socialMedia.discord : `https://discord.gg/${socialMedia.discord}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => setModalState({ type: 'edit', coach })}
                        className="h-8 px-3 bg-gray-500 text-white hover:bg-gray-600 rounded-md text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCoach(coach)}
                        className="h-8 px-3 bg-red-600 text-white hover:bg-red-500 rounded-md text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
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
