import React, { useState, useEffect } from 'react';

function UploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState('');
  const [uploadController, setUploadController] = useState(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4 GB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setMessage('File is too large. The maximum upload size is 4GB.');
      setFileName('');
      e.target.value = null;
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);
    setMessage(`Preparing upload for ${file.name}...`);

    // Get pre-signed URL from Netlify function
    fetch('/.netlify/functions/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, contentType: file.type }),
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }
        return res.json();
    })
    .then(({ uploadURL, key }) => {
      setMessage(`Uploading ${file.name}...`);
      
      // Create AbortController for cancellation
      const controller = new AbortController();
      setUploadController(controller);

      // Progress simulation for better UX
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress < 90) {
          setUploadProgress(progress.toFixed(2));
        }
      }, 200);

      // Upload using fetch with the pre-signed URL
      fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        signal: controller.signal,
      })
      .then(response => {
        clearInterval(progressInterval);
        
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }
        
        setUploadProgress(100);
        setIsUploading(false);
        setNotification(`${fileName} has been uploaded successfully!`);
        setMessage('');
        setFileName('');
        setUploadController(null);
        e.target.value = null; // Reset file input
      })
      .catch(error => {
        clearInterval(progressInterval);
        if (error.name === 'AbortError') {
          setMessage('Upload canceled.');
        } else {
          console.error("Upload failed:", error);
          setMessage(`Upload failed: ${error.message}`);
        }
        setIsUploading(false);
        setUploadController(null);
      });
    })
    .catch(err => {
        console.error("Error preparing upload:", err);
        setIsUploading(false);
        setMessage(`Could not prepare upload: ${err.message}`);
        setUploadController(null);
    });
  };

  const handleCancel = () => {
    if (uploadController) {
      uploadController.abort();
      setIsUploading(false);
      setMessage('Upload canceled.');
      setFileName('');
      setUploadController(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {notification && (
        <div className="fixed top-5 right-5 rounded-xl border border-green-500/30 bg-green-900/50 backdrop-blur-lg shadow-2xl p-4 max-w-sm w-full text-white text-center z-50">
          {notification}
        </div>
      )}
      
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl mb-6">
          Upload Your
          <span className="block bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
            Gameplay VoD
          </span>
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
          Share your gameplay footage with our expert coaches and get professional analysis to improve your competitive performance.
        </p>
      </div>

      {/* Upload Panel */}
      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl mb-16">
        <div className="p-8 space-y-6">
          <div>
              <label htmlFor="file-upload" className="cursor-pointer w-full h-12 px-6 bg-sky-500 text-white hover:bg-sky-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold transition-all duration-300 hover:scale-105">
                  {isUploading ? 'Uploading...' : 'Choose File'}
              </label>
              <input 
                id="file-upload"
                name="file-upload"
                type="file" 
                className="hidden"
                accept="video/mp4,video/mkv,video/avi,video/mov" 
                onChange={handleFileChange} 
                disabled={isUploading} 
              />
              <p className="text-center text-xs text-white/60 mt-3">
                  Supported formats: MP4, MKV, AVI, MOV. Max size: 4GB.
              </p>
              {fileName && !isUploading && <p className="text-center text-sm text-white/80 mt-2">Selected: {fileName}</p>}
          </div>
          
          {isUploading && (
            <div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-center text-sm text-white/80 mt-2">{uploadProgress}%</p>
              <div className="mt-4 flex justify-center">
                  <button onClick={handleCancel} className="h-10 px-6 bg-red-600 text-white hover:bg-red-500 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:scale-105">
                    Cancel Upload
                  </button>
              </div>
            </div>
          )}

          {message && <p className="text-sm text-center text-white/80">{message}</p>}
        </div>
      </div>

      {/* What Happens Next Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">What Happens Next?</h2>
        <p className="text-lg text-white/70 max-w-3xl mx-auto">
          Once your VoD is uploaded, our professional coaches will analyze your gameplay and provide detailed feedback to help you improve your competitive performance.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center hover:bg-black/40 hover:border-sky-400/50 hover:scale-105 hover:-translate-y-2 hover:shadow-sky-500/20 transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-sky-500/30 group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-sky-400 group-hover:text-sky-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-sky-300 transition-colors duration-300">Easy Upload</h3>
          <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
            Drag and drop your gameplay videos. Support for MP4, MKV, AVI, and MOV formats up to 4GB.
          </p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center hover:bg-black/40 hover:border-green-400/50 hover:scale-105 hover:-translate-y-2 hover:shadow-green-500/20 transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors duration-300">Professional Review</h3>
          <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
            Get detailed feedback from experienced coaches with timestamped notes and actionable insights.
          </p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 text-center hover:bg-black/40 hover:border-purple-400/50 hover:scale-105 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">Track Progress</h3>
          <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
            Monitor your improvement over time with detailed analytics and personalized coaching recommendations.
          </p>
        </div>
      </div>

      {/* Upload Guidelines Section */}
      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 mb-16">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Upload Guidelines</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Best Practices
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>• Upload recent gameplay for relevant feedback</li>
              <li>• Include both wins and losses for balanced analysis</li>
              <li>• Choose games where you want specific improvement</li>
              <li>• Ensure good video quality (720p or higher)</li>
              <li>• Include audio for communication analysis</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Technical Requirements
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>• Supported formats: MP4, MKV, AVI, MOV</li>
              <li>• Maximum file size: 4GB</li>
              <li>• Minimum resolution: 720p recommended</li>
              <li>• Game audio and comms preferred</li>
              <li>• Match duration: 10-60 minutes ideal</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Community CTA Section */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">Join Our Community</h3>
        <p className="text-white/70 mb-6 max-w-2xl mx-auto">
          While waiting for your VoD review, connect with other players, ask questions, and learn from our coaching community on Discord.
        </p>
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
      </div>
    </div>
  );
}

export default UploadPanel;
