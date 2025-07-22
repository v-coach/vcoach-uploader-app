import React, { useState } from 'react';
import * as tus from 'tus-js-client';

function UploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [upload, setUpload] = useState(null);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');

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
    setIsUploading(false); // We won't start the upload for this test
    setMessage(`Testing connection for ${file.name}...`);

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
    .then((data) => {
      // If this message appears in your browser console, the connection is working.
      console.log("SUCCESSFULLY RECEIVED RESPONSE FROM FUNCTION:", data);
      setMessage("Debug successful! Check the browser console (F12) for details.");
    })
    .catch(err => {
        console.error("Error during debug fetch:", err);
        setMessage('Debug test failed. The frontend cannot reach the backend function.');
    });
  };

  const handleCancel = () => {
    if (upload) {
      upload.abort();
      setIsUploading(false);
      setMessage('Upload canceled.');
      setFileName('');
    }
  };

  return (
    <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl">
      <div className="p-8 space-y-6">
        <div>
            <label htmlFor="file-upload" className="cursor-pointer w-full h-12 px-6 bg-sky-500 text-white hover:bg-sky-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold">
                Choose File for Debug Test
            </label>
            <input 
              id="file-upload"
              name="file-upload"
              type="file" 
              className="hidden"
              accept="video/mp4,video/mkv" 
              onChange={handleFileChange} 
              disabled={isUploading} 
            />
            <p className="text-center text-xs text-white/60 mt-3">
                Supported formats: MP4, MKV. Max size: 4GB.
            </p>
            {fileName && !isUploading && <p className="text-center text-sm text-white/80 mt-2">Selected: {fileName}</p>}
        </div>
        
        {message && <p className="text-sm text-center text-white/80">{message}</p>}
      </div>
    </div>
  );
}

export default UploadPanel;
