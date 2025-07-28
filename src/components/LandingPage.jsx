import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

// Mock API function - replace with your actual API call
const getCoaches = async () => {
    const response = await fetch('/.netlify/functions/get-coaches?limit=4'); // Fetch only 4 coaches for the landing page
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const LandingPage = () => {
  const { data: coaches = [], isLoading, error } = useQuery({
    queryKey: ['coaches-landing'],
    queryFn: getCoaches,
  });

  const avatarColors = [
    'from-red-500 to-orange-500', 'from-blue-500 to-teal-500',
    'from-green-400 to-blue-600', 'from-purple-500 to-pink-500',
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="text-center py-20 lg:py-32" style={{background: 'radial-gradient(ellipse at top, #1a202c, #111827)'}}>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
          Unlock Your Potential
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
          Connect with world-class coaches who are dedicated to helping you achieve your personal and professional goals.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-indigo-600 text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
          Get Started
          <ArrowRight className="inline-block ml-2" />
        </Link>
      </div>

      {/* Featured Coaches Section */}
      <div className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Meet Our Top Coaches
          </h2>
          {isLoading && <div className="text-center">Loading coaches...</div>}
          {error && <div className="text-center text-red-400">Could not load coaches.</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coaches.map((coach, index) => {
              const profileImage = coach.profileImageUrl || coach.profileimage;
              const avatarColor = avatarColors[index % avatarColors.length];

              return (
                <div key={coach.id} className="bg-black/20 border border-white/10 rounded-xl p-6 text-center backdrop-blur-md transition-all duration-300 hover:border-indigo-500 hover:scale-105">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={coach.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className={`w-24 h-24 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-2xl font-bold text-white">
                        {coach.initials || coach.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mt-4">{coach.name}</h3>
                  <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
