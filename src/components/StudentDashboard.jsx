import React from 'react';
import UploadPanel from './UploadPanel';

function StudentDashboard() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full">
        <UploadPanel />
      </div>
    </div>
  );
}

export default StudentDashboard;
