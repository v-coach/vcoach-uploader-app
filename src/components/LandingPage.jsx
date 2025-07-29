import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

function LandingPage() {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [loadingPricing, setLoadingPricing] = useState(true);

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
        setLoadingCoaches(false);
      }
    };

    const fetchPricingPlans = async () => {
      try {
        const res = await axios.get('/.netlify/functions/manage-pricing');
        setPricingPlans(res.data || []);
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
        // Show default pricing plans if API fails
        setPricingPlans([
          {
            id: 'free',
            name: 'Free Plan',
            price: 0.00,
            currency: 'USD',
            interval: 'month',
            features: [
              'Basic VoD Upload',
              'Community Access',
              'Basic Analytics'
            ],
            color: 'green',
            popular: false,
            description: 'Get started with basic features',
            buttonText: 'Subscribe'
          },
          {
            id: 'individual',
            name: 'Individual Plan',
            price: 26.99,
            currency: 'USD',
            interval: 'month',
            features: [
              'Priority VoD Review',
              '1-on-1 Coaching Sessions',
              'Detailed Analytics',
              'Custom Training Plans'
            ],
            color: 'sky',
            popular: true,
            description: 'Perfect for individual players',
            buttonText: 'Subscribe'
          },
          {
            id: 'team',
            name: 'Team Plan',
            price: 100.99,
            currency: 'USD',
            interval: 'month',
            features: [
              'Team VoD Analysis',
              'Group Coaching Sessions',
              'Strategy Development',
              'Tournament Preparation'
            ],
            color: 'blue',
            popular: false,
            description: 'Designed for competitive teams',
            buttonText: 'Subscribe'
          }
        ]);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchCoaches();
    fetchPricingPlans();
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

  const getPlanColorClasses = (color) => {
    const colorMap = {
      gray: { border: 'hover:border-gray-400/50', shadow: 'hover:shadow-gray-500/20', text: 'group-hover:text-gray-300', bg: 'bg-gray-500' },
      red: { border: 'hover:border-red-400/50', shadow: 'hover:shadow-red-500/20', text: 'group-hover:text-red-300', bg: 'bg-red-500' },
      orange: { border: 'hover:border-orange-400/50', shadow: 'hover:shadow-orange-500/20', text: 'group-hover:text-orange-300', bg: 'bg-orange-500' },
      yellow: { border: 'hover:border-yellow-400/50', shadow: 'hover:shadow-yellow-500/20', text: 'group-hover:text-yellow-300', bg: 'bg-yellow-500' },
      green: { border: 'hover:border-green-400/50', shadow: 'hover:shadow-green-500/20', text: 'group-hover:text-green-300', bg: 'bg-green-500' },
      blue: { border: 'hover:border-blue-400/50', shadow: 'hover:shadow-blue-500/20', text: 'group-hover:text-blue-300', bg: 'bg-blue-500' },
      indigo: { border: 'hover:border-indigo-400/50', shadow: 'hover:shadow-indigo-500/20', text: 'group-hover:text-indigo-300', bg: 'bg-indigo-500' },
      purple: { border: 'hover:border-purple-400/50', shadow: 'hover:shadow-purple-500/20', text: 'group-hover:text-purple-300', bg: 'bg-purple-500' },
      pink: { border: 'hover:border-pink-400/50', shadow: 'hover:shadow-pink-500/20', text: 'group-hover:text-pink-300', bg: 'bg-pink-500' },
      sky: { border: 'hover:border-sky-400/50', shadow: 'hover:shadow-sky-500/20', text: 'group-hover:text-sky-300', bg: 'bg-sky-500' }
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl mb-6 hover:scale-105 transition-transform duration-500">
          Welcome to
          <span className="block bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent hover:from-sky-300 hover:to-blue-500 transition-all duration-300">
            V-Coach Central
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed hover:text-white/90 transition-colors duration-300">
          The ultimate platform for competitive gaming improvement. Upload your gameplay, get professional analysis, and take your skills to the next level.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="https://discord.gg/yb3AntSnaS"
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 px-8 bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/25 inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord Community
          </a>
          {user && (user.roles.includes('Coach') || user.roles.includes('Head Coach') || user.roles.includes('Founders')) && (
            <Link 
              to="/coach" 
              className="h-14 px-8 bg-white/10 text-white hover:bg-white/20 hover:border-sky-400 border border-white/20 inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-medium backdrop-blur-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Coach Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center hover:bg-black/40 hover:border-green-400/50 hover:scale-105 hover:-translate-y-2 hover:shadow-green-500/20 transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors duration-300">Start Your Journey</h3>
          <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
            Select a plan and join our community to begin your competitive gaming improvement journey.
          </p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center hover:bg-black/40 hover:border-orange-400/50 hover:scale-105 hover:-translate-y-2 hover:shadow-orange-500/20 transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500/30 group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-orange-300 transition-colors duration-300">Learn & Engage</h3>
          <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
            Access coaching resources, participate in community discussions, and learn from experienced players.
          </p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center hover:bg-black/40 hover:border-purple-400/50 hover:scale-105 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">See Results</h3>
          <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
            Apply insights from coaching sessions and community feedback to achieve your competitive gaming goals.
          </p>
        </div>
      </div>

      {/* How It Works Section with Flashing Dots Animation */}
      <div id="how-it-works" className="text-center mb-12 relative">
        <h2 className="text-4xl font-bold text-white mb-12 hover:text-sky-300 transition-colors duration-300">How It Works</h2>
        
        {/* Steps Container */}
        <div className="relative">
          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            <div className="flex flex-col items-center group cursor-pointer">
              <div 
                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:bg-green-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 relative z-10 shadow-xl shadow-green-500/60 border-2 border-green-300"
                style={{
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '0s'
                }}
              >1</div>
              <h4 className="font-semibold text-white mb-2 group-hover:text-green-300 transition-colors duration-300">Subscribe</h4>
              <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">Select a plan that fits your needs</p>
            </div>
            
            <div className="flex flex-col items-center group cursor-pointer">
              <div 
                className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:bg-orange-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 relative z-10 shadow-xl shadow-orange-500/60 border-2 border-orange-300"
                style={{
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '1.5s'
                }}
              >2</div>
              <h4 className="font-semibold text-white mb-2 group-hover:text-orange-300 transition-colors duration-300">Engage</h4>
              <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">Connect with the community</p>
            </div>
            
            <div className="flex flex-col items-center group cursor-pointer">
              <div 
                className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:bg-pink-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300 relative z-10 shadow-xl shadow-pink-500/60 border-2 border-pink-300"
                style={{
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '3s'
                }}
              >3</div>
              <h4 className="font-semibold text-white mb-2 group-hover:text-pink-300 transition-colors duration-300">Learn</h4>
              <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">Coaching sessions and documents</p>
            </div>
            
            <div className="flex flex-col items-center group cursor-pointer">
              <div 
                className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:bg-red-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all duration-300 relative z-10 shadow-xl shadow-red-500/60 border-2 border-red-300"
                style={{
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '4.5s'
                }}
              >4</div>
              <h4 className="font-semibold text-white mb-2 group-hover:text-red-300 transition-colors duration-300">Improve</h4>
              <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">Apply insights to rank up</p>
            </div>
          </div>

          {/* Flashing Dots Animation - Hidden on Mobile */}
          <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 pointer-events-none">
            {/* Background Line */}
            <div className="absolute left-[12.5%] right-[12.5%] h-0.5 bg-white/20 top-0"></div>
            
            {/* Animated Progress Line - Updated with gradient colors */}
            <div className="absolute left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-green-500 via-orange-500 via-pink-500 to-red-500 top-0 opacity-60"></div>
            
            {/* String of Flashing Dots - 2 dots per stage, updated colors */}
            <div className="absolute left-[12.5%] right-[12.5%] top-0">
              {/* Stage 1-2: Subscribe to Engage */}
              <div 
                className="absolute w-3 h-3 bg-green-500 rounded-full top-[-4.5px] shadow-xl shadow-green-500/80 border border-green-300" 
                style={{
                  left: '11%',
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '0.45s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-orange-400 rounded-full top-[-4.5px] shadow-xl shadow-orange-400/80 border border-orange-200" 
                style={{
                  left: '22%',
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '0.9s'
                }}
              ></div>
              
              {/* Stage 2-3: Engage to Learn */}
              <div 
                className="absolute w-3 h-3 bg-orange-500 rounded-full top-[-4.5px] shadow-xl shadow-orange-500/80 border border-orange-300" 
                style={{
                  left: '44.5%',
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '1.95s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-pink-400 rounded-full top-[-4.5px] shadow-xl shadow-pink-400/80 border border-pink-200" 
                style={{
                  left: '55.5%',
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '2.4s'
                }}
              ></div>
              
              {/* Stage 3-4: Learn to Improve */}
              <div 
                className="absolute w-3 h-3 bg-pink-500 rounded-full top-[-4.5px] shadow-xl shadow-pink-500/80 border border-pink-300" 
                style={{
                  left: '78%',
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '3.45s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-red-400 rounded-full top-[-4.5px] shadow-xl shadow-red-400/80 border border-red-200" 
                style={{
                  left: '89%',
                  animation: 'flashDot 6s infinite linear',
                  animationDelay: '3.9s'
                }}
              ></div>
            </div>
          </div>

          {/* Mobile Animated Dots */}
          <div className="md:hidden flex flex-col items-center space-y-2 absolute left-1/2 transform -translate-x-1/2 top-16 pointer-events-none">
            {/* Stage 1-2 */}
            <div className="w-1 h-5 bg-white/20 relative flex flex-col justify-center space-y-1">
              <div className="w-3 h-3 bg-green-500 rounded-full absolute left-[-5px] shadow-lg shadow-green-500/60 border border-green-300" style={{animation: 'flashDot 6s infinite', animationDelay: '0.45s', top: '0px'}}></div>
              <div className="w-3 h-3 bg-orange-400 rounded-full absolute left-[-5px] shadow-lg shadow-orange-400/60 border border-orange-200" style={{animation: 'flashDot 6s infinite', animationDelay: '0.9s', top: '12px'}}></div>
            </div>
            
            {/* Stage 2-3 */}
            <div className="w-1 h-5 bg-white/20 relative flex flex-col justify-center space-y-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full absolute left-[-5px] shadow-lg shadow-orange-500/60 border border-orange-300" style={{animation: 'flashDot 6s infinite', animationDelay: '1.95s', top: '0px'}}></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full absolute left-[-5px] shadow-lg shadow-pink-400/60 border border-pink-200" style={{animation: 'flashDot 6s infinite', animationDelay: '2.4s', top: '12px'}}></div>
            </div>
            
            {/* Stage 3-4 */}
            <div className="w-1 h-5 bg-white/20 relative flex flex-col justify-center space-y-1">
              <div className="w-3 h-3 bg-pink-500 rounded-full absolute left-[-5px] shadow-lg shadow-pink-500/60 border border-pink-300" style={{animation: 'flashDot 6s infinite', animationDelay: '3.45s', top: '0px'}}></div>
              <div className="w-3 h-3 bg-red-400 rounded-full absolute left-[-5px] shadow-lg shadow-red-400/60 border border-red-200" style={{animation: 'flashDot 6s infinite', animationDelay: '3.9s', top: '12px'}}></div>
            </div>
          </div>
        </div>

        {/* Custom CSS for flashing dots animation */}
        <style jsx>{`
          @keyframes flashDot {
            0%, 85% { 
              opacity: 0.2; 
              transform: scale(0.6); 
              box-shadow: 0 0 5px currentColor;
            }
            7%, 20% { 
              opacity: 1; 
              transform: scale(1.4); 
              box-shadow: 0 0 20px currentColor, 0 0 35px currentColor, 0 0 50px currentColor;
            }
            30%, 100% { 
              opacity: 0.2; 
              transform: scale(0.6); 
              box-shadow: 0 0 5px currentColor;
            }
          }
        `}</style>
      </div>

      {/* Meet Our Coaches Section */}
      <div id="coaches" className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4 hover:text-sky-300 transition-colors duration-300">Meet Our Expert Coaches</h2>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto hover:text-white/90 transition-colors duration-300">
          Learn from professional players and experienced coaches who have helped hundreds of players reach their competitive goals.
        </p>
        
        {loadingCoaches ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-6 text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-white/10 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded mb-4 animate-pulse"></div>
                <div className="h-16 bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : coaches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {coaches.map((coach) => (
              <div key={coach.id} className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-6 text-center hover:bg-black/40 hover:border-sky-400/50 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/20 transition-all duration-300 group cursor-pointer">
                {coach.profileImage ? (
                  <img 
                    src={coach.profileImage}
                    alt={coach.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20 mx-auto mb-4 group-hover:border-sky-400/50 group-hover:scale-110 transition-all duration-300"
                  />
                ) : (
                  <div className={`w-24 h-24 bg-gradient-to-br ${coach.avatarColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300`}>
                    <span className="text-2xl font-bold text-white">{coach.initials}</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-300 transition-colors duration-300">{coach.name}</h3>
                <div className="text-sky-400 font-semibold mb-3 group-hover:text-sky-300 transition-colors duration-300">{coach.title}</div>
                <p className="text-white/70 text-sm mb-4 group-hover:text-white/90 transition-colors duration-300">
                  {coach.description}
                </p>
                {coach.skills && coach.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {coach.skills.map((skill, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-xs ${getSkillColor(coach.avatarColor)} hover:scale-105 transition-transform duration-200`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social Media Links */}
                {coach.socialMedia && Object.values(coach.socialMedia).some(link => link) && (
                  <div className="flex justify-center space-x-3 mt-4">
                    {coach.socialMedia.twitter && (
                      <a href={coach.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-500 hover:bg-blue-600 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                    {coach.socialMedia.instagram && (
                      <a href={coach.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40z"/>
                        </svg>
                      </a>
                    )}
                    {coach.socialMedia.youtube && (
                      <a href={coach.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-red-500 hover:bg-red-600 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                    {coach.socialMedia.twitch && (
                      <a href={coach.socialMedia.twitch} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-purple-600 hover:bg-purple-700 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.571 4.714h.857c2.329 0 4.429 1.143 4.429 2.571v9.43c0 1.427-2.1 2.571-4.429 2.571h-.857C9.243 19.286 7.143 18.143 7.143 16.715V7.285C7.143 5.857 9.243 4.714 11.571 4.714z"/>
                        </svg>
                      </a>
                    )}
                    {coach.socialMedia.discord && (
                      <a href={coach.socialMedia.discord.startsWith('http') ? coach.socialMedia.discord : `https://discord.gg/${coach.socialMedia.discord}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </a>
                    )}
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
              className="h-12 px-6 bg-white/10 text-white hover:bg-white/20 hover:border-sky-400 border border-white/20 inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              + Manage Coaches
            </Link>
          </div>
        )}
      </div>

      {/* Dynamic Subscription Plans Section */}
      <div id="pricing" className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4 hover:text-sky-300 transition-colors duration-300">Choose Your Plan</h2>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto hover:text-white/90 transition-colors duration-300">
          Select the perfect plan for your gaming journey. Upgrade your skills with professional coaching and exclusive features.
        </p>
        
        {loadingPricing ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-white/10 rounded mb-2 animate-pulse"></div>
                <div className="h-8 bg-white/10 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded mb-6 animate-pulse"></div>
                <div className="h-12 bg-white/10 rounded mb-6 animate-pulse"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-white/10 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : pricingPlans.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => {
              const colors = getPlanColorClasses(plan.color);
              
              return (
                <div key={plan.id} className={`rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center relative hover:bg-black/40 ${colors.border} hover:scale-105 hover:-translate-y-3 ${colors.shadow} transition-all duration-300 group cursor-pointer`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
                      <div className="bg-sky-500 text-white px-4 py-1 rounded-full text-xs font-bold group-hover:bg-sky-400 transition-colors duration-300">MOST POPULAR</div>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <img src="/vcoachlg.jpg" alt="V-Coach Logo" className="w-16 h-16 mx-auto mb-4 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                    <h3 className={`text-2xl font-bold text-white mb-2 ${colors.text} transition-colors duration-300`}>{plan.name}</h3>
                    <div className={`text-4xl font-bold text-white mb-2 ${colors.text} transition-colors duration-300`}>
                      ${plan.price.toFixed(2)}
                    </div>
                    <div className="text-white/60 text-sm group-hover:text-white/80 transition-colors duration-300">
                      {plan.currency} / {plan.interval}
                    </div>
                    {plan.description && (
                      <p className="text-white/70 text-sm mt-2 group-hover:text-white/90 transition-colors duration-300">
                        {plan.description}
                      </p>
                    )}
                  </div>
                  
                  <button className={`w-full h-12 px-6 ${colors.bg} text-white ${colors.hover} hover:shadow-lg hover:shadow-${plan.color}-500/50 rounded-xl text-lg font-bold mb-6 transition-all duration-300 hover:scale-105`}>
                    {plan.buttonText}
                  </button>
                  
                  <div className="space-y-4 text-left">
                    <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 group-hover:text-white/80 transition-colors duration-300">Features</div>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 group-hover:scale-105 transition-transform duration-200">
                        <div className={`w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80 text-sm group-hover:text-white transition-colors duration-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-white/60 py-8">
            <p>Pricing plans will be available soon.</p>
          </div>
        )}

        {/* Manage Pricing Button - Only visible to admins */}
        {user && user.roles?.includes('Founders') && (
          <div className="text-center mt-8">
            <Link 
              to="/admin"
              className="h-12 px-6 bg-white/10 text-white hover:bg-white/20 hover:border-sky-400 border border-white/20 inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              + Manage Pricing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;
