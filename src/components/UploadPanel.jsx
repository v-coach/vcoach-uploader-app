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

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);
    setMessage(`Uploading ${file.name}...`);

    fetch('/.netlify/functions/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, contentType: file.type }),
    })
    .then(res => res.json())
    .then(({ uploadURL }) => {
      const tusUpload = new tus.Upload(file, {
        endpoint: uploadURL,
        retryDelays: [0, 3000, 5000, 10000],
        metadata: { filename: file.name, filetype: file.type },
        onError: (error) => {
          console.error("Failed because: ", error);
          setIsUploading(false);
          setMessage('Upload failed. Please try again.');
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress(percentage);
        },
        onSuccess: () => {
          setIsUploading(false);
          setMessage('Upload complete!');
          setFileName(''); // Clear file name on success
        },
      });
      setUpload(tusUpload);
      tusUpload.start();
    })
    .catch(err => {
        console.error("Error getting upload URL:", err);
        setIsUploading(false);
        setMessage('Could not prepare upload. Please try again.');
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
            <label htmlFor="file-upload" className="cursor-pointer w-full h-12 px-6 bg-white text-gray-900 hover:bg-gray-200 inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold">
                {isUploading ? 'Uploading...' : 'Choose File'}
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
            {fileName && !isUploading && <p className="text-center text-sm text-white/80 mt-3">Selected: {fileName}</p>}
        </div>
        
        {isUploading && (
          <div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div className="bg-white h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="text-center text-sm text-white/80 mt-2">{uploadProgress}%</p>
            <button onClick={handleCancel} className="mt-4 w-full h-11 px-4 py-2 bg-red-600 text-white hover:bg-red-500 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium">
              Cancel Upload
            </button>
          </div>
        )}

        {message && <p className="text-sm text-center text-white/80">{message}</p>}
      </div>
    </div>
  );
}

export default UploadPanel;
