import React from 'react';
import UploadPanel from './UploadPanel';

function StudentDashboard() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Student Upload</h1>
        <p className="text-muted-foreground">Select a VoD file from your computer to upload for review.</p>
      </div>
      <div className="w-full max-w-2xl">
        <UploadPanel />
      </div>
    </div>
  );
}

export default StudentDashboard;
