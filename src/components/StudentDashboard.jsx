import React from 'react';
import UploadPanel from './UploadPanel';

function StudentDashboard() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">V-Coach VoD Upload</h1>
        <p className="text-white/80 mt-2">Select a video file from your computer to upload for review.</p>
      </div>
      <div className="w-full max-w-2xl">
        <UploadPanel />
      </div>
    </div>
  );
}

export default StudentDashboard;
