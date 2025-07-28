import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

function LandingPage() {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const res = await axios.get('/.netlify/functions/manage-coaches');
        setCoaches(res.data || []);
      } catch (err) {
        console.error('Failed to fetch coaches:', err);
        // If no coaches exist, show default coaches
        setCoaches([
          {
            id: '1',
            name: 'Coach Jordan',
            title: 'Head Coach',
            description: 'Former professional player with 5+ years coaching experience. Specializes in strategic gameplay and team coordination.',
            skills: ['Strategy', 'Team Play', 'Leadership'],
            avatarColor: 'from-sky-400 to-blue-600',
            initials: 'JD'
          },
          {
            id: '2',  
            name: 'Coach Alex',
            title: 'Mechanics Coach',
            description: 'Expert in mechanical skill development and precision training. Helps players master the fundamentals and advanced techniques.',
            skills: ['Mechanics', 'Aim Training', 'Movement'],
            avatarColor: 'from-green-400 to-emerald-600',
            initials: 'AS'
          },
          {
            id: '3',
            name: 'Coach Morgan', 
            title: 'Mental Performance Coach',
            description: 'Focuses on mindset, tilt management, and peak performance psychology. Helps players maintain consistency under pressure.',
            skills: ['Mindset', 'Focus', 'Consistency'],
            avatarColor: 'from-purple-400 to-violet-600',
            initials: 'MK'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

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
    <div className="flex flex-col min-h-[80vh]">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl mb-6">
          Welcome to
          <span className="block bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
            V-Coach Central
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
          The ultimate platform for competitive gaming improvement. Upload your gameplay, get professional analysis, and take your skills to the next level.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/upload" 
            className="h-14 px-8 bg-sky-500 text-white hover:bg-sky-600 inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Upload Your VoD
          </Link>
          {user && (user.roles.includes('Coach') || user.roles.includes('Head Coach') || user.roles.includes('Founders')) && (
            <Link 
              to="/coach" 
              className="h-14 px-8 bg-white/10 text-white hover:bg-white/20 border border-white/20 inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-medium backdrop-blur-lg transition-all duration-300 transform hover:scale-105"
            >
              Coach Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Easy Upload</h3>
          <p className="text-white/70">
            Drag and drop your gameplay videos. Support for MP4, MKV, AVI, and MOV formats up to 4GB.
          </p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Professional Review</h3>
          <p className="text-white/70">
            Get detailed feedback from experienced coaches with timestamped notes and actionable insights.
          </p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Track Progress</h3>
          <p className="text-white/70">
            Monitor your improvement over time with detailed analytics and personalized coaching recommendations.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">1</div>
            <h4 className="font-semibold text-white mb-2">Upload</h4>
            <p className="text-white/70 text-sm">Share your gameplay video</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">2</div>
            <h4 className="font-semibold text-white mb-2">Review</h4>
            <p className="text-white/70 text-sm">Coaches analyze your gameplay</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
            <h4 className="font-semibold text-white mb-2">Learn</h4>
            <p className="text-white/70 text-sm">Receive detailed feedback</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">4</div>
            <h4 className="font-semibold text-white mb-2">Improve</h4>
            <p className="text-white/70 text-sm">Apply insights to rank up</p>
          </div>
        </div>
      </div>

      {/* Meet Our Coaches Section */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Meet Our Expert Coaches</h2>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
          Learn from professional players and experienced coaches who have helped hundreds of players reach their competitive goals.
        </p>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-6 text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-white/10 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded mb-4 animate-pulse"></div>
                <div className="h-16 bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : coaches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {coaches.map((coach) => (
              <div key={coach.id} className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-6 text-center">
                {coach.profileImage ? (
                  <img 
                    src={coach.profileImage}
                    alt={coach.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20 mx-auto mb-4"
                  />
                ) : (
                  <div className={`w-24 h-24 bg-gradient-to-br ${coach.avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl font-bold text-white">{coach.initials}</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{coach.name}</h3>
                <div className="text-sky-400 font-semibold mb-3">{coach.title}</div>
                <p className="text-white/70 text-sm mb-4">
                  {coach.description}
                </p>
                {coach.skills && coach.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {coach.skills.map((skill, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-xs ${getSkillColor(coach.avatarColor)}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/60 mb-8">
            <p>No coaches available at the moment.</p>
          </div>
        )}

        {/* Add Coach Button - Only visible to admins */}
        {user && user.roles?.includes('Founders') && (
          <div className="text-center">
            <Link 
              to="/admin"
              className="h-12 px-6 bg-white/10 text-white hover:bg-white/20 border border-white/20 inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium backdrop-blur-lg transition-all duration-300"
            >
              + Manage Coaches
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-8 text-center mb-16">
        <div className="rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6">
          <div className="text-3xl font-bold text-sky-400 mb-2">500+</div>
          <div className="text-white/80">VoDs Reviewed</div>
        </div>
        <div className="rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6">
          <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
          <div className="text-white/80">Improvement Rate</div>
        </div>
        <div className="rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6">
          <div className="text-3xl font-bold text-purple-400 mb-2">24hr</div>
          <div className="text-white/80">Average Turnaround</div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
