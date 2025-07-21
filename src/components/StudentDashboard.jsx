import React from 'react';
import UploadPanel from './UploadPanel';

function StudentDashboard() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-center">Student Upload</h1>
      <div className="max-w-2xl mx-auto">
        {/* This line adds the upload panel to the page */}
        <UploadPanel />
      </div>
    </div>
  );
}

export default StudentDashboard;
