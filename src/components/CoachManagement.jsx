import React, { useState } from 'react';
import { useAuth } from '../AuthContext'; // Corrected import path
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, X, Image as ImageIcon, Upload, AlertTriangle } from 'lucide-react';

// Mock API functions - replace with your actual API calls
// You would typically have these in a separate api.js file
const getCoaches = async () => {
  const response = await fetch('/.netlify/functions/get-coaches');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch coaches: ${errorText}`);
  }
  return response.json();
};

const addCoach = async (coachData) => {
  const response = await fetch('/.netlify/functions/add-coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coachData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add coach: ${errorText}`);
  }
  return response.json();
};

const uploadCoachImage = async ({ coachId, file }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('coachId', coachId);

    const response = await fetch('/.netlify/functions/upload-coach-image', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image upload failed: ${errorText}`);
    }
    return response.json();
};


const CoachManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoachName, setNewCoachName] = useState('');
  const [newCoachInitials, setNewCoachInitials] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingCoachId, setUploadingCoachId] = useState(null);

  const { data: coaches = [], isLoading, error } = useQuery({
    queryKey: ['coaches'],
    queryFn: getCoaches,
  });

  const addCoachMutation = useMutation({
    mutationFn: addCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] });
      setIsModalOpen(false);
      setNewCoachName('');
      setNewCoachInitials('');
    },
    onError: (err) => {
        alert(`Failed to add coach: ${err.message}`);
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadCoachImage,
    onSuccess: (data) => {
        queryClient.setQueryData(['coaches'], (oldData) =>
            oldData.map((coach) =>
                coach.id === data.coach.id ? data.coach : coach
            )
        );
        setUploadingCoachId(null);
        setImageFile(null);
        setImagePreview('');
    },
    onError: (err) => {
        alert(`Failed to upload image: ${err.message}`);
        setUploadingCoachId(null);
    }
  });


  const handleAddCoach = (e) => {
    e.preventDefault();
    addCoachMutation.mutate({ name: newCoachName, initials: newCoachInitials });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = (coachId) => {
    if (imageFile) {
        setUploadingCoachId(coachId);
        uploadImageMutation.mutate({ coachId, file: imageFile });
    }
  };
  
  const avatarColors = [
    'from-red-500 to-orange-500', 'from-blue-500 to-teal-500',
    'from-green-400 to-blue-600', 'from-purple-500 to-pink-500',
    'from-yellow-400 to-lime-500',
  ];

  if (isLoading) {
    return <div className="text-center p-8">Loading coaches...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-400">Error loading coaches: {error.message}</div>;
  }

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Manage Coaches</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105">
          <PlusCircle className="mr-2" /> Add Coach
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {coaches.map((coach, index) => {
          const profileImage = coach.profileImageUrl || coach.profileimage; // Handle potential inconsistencies
          const avatarColor = avatarColors[index % avatarColors.length];
          
          return (
            <div key={coach.id} className="rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6 text-center">
              {profileImage ? (
                <div className="relative w-16 h-16 mx-auto mb-4">
                   <img 
                    src={profileImage}
                    alt={coach.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                        console.error("❌ Coach image failed to load:", profileImage);
                        e.currentTarget.style.display = 'none'; // Hide broken image
                        // You can optionally add a fallback to initials here
                    }}
                  />
                </div>
              ) : (
                <div className={`w-16 h-16 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-lg font-bold text-white">
                    {coach.initials || coach.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold">{coach.name}</h3>
              
              <div className="mt-4">
                <input type="file" id={`file-upload-${coach.id}`} className="hidden" onChange={handleFileChange} accept="image/*" />
                <label htmlFor={`file-upload-${coach.id}`} className="cursor-pointer text-sm text-indigo-400 hover:text-indigo-300">
                  {uploadingCoachId === coach.id ? 'Uploading...' : 'Change Photo'}
                </label>
                {imagePreview && (
                  <div className="mt-2">
                    <button onClick={() => handleImageUpload(coach.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded-md">
                      <Upload className="inline-block w-4 h-4 mr-1"/>
                      Confirm & Upload
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-8 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add New Coach</h2>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleAddCoach}>
              <div className="mb-4">
                <label htmlFor="coachName" className="block text-sm font-medium mb-2">Coach Name</label>
                <input type="text" id="coachName" value={newCoachName} onChange={(e) => setNewCoachName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="mb-6">
                <label htmlFor="coachInitials" className="block text-sm font-medium mb-2">Initials</label>
                <input type="text" id="coachInitials" value={newCoachInitials} onChange={(e) => setNewCoachInitials(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" maxLength="2" required />
              </div>
              <button type="submit" disabled={addCoachMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50">
                {addCoachMutation.isPending ? 'Adding...' : 'Add Coach'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachManagement;
