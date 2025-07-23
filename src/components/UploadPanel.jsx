import React, { useState, useEffect } from 'react';
import * as tus from 'tus-js-client';

function UploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [upload, setUpload] = useState(null);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 5000); // Notification disappears after 5 seconds
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
    .then(({ uploadURL }) => {
      setMessage(`Uploading ${file.name}...`);
      const tusUpload = new tus.Upload(file, {
        endpoint: uploadURL,
        retryDelays: [0, 3000, 5000, 10000],
        metadata: { filename: file.name, filetype: file.type },
        onError: (error) => {
          console.error("Upload failed:", error);
          setIsUploading(false);
          setMessage('Upload failed. Please try again.');
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress(percentage);
        },
        onSuccess: () => {
          setIsUploading(false);
          setNotification(`${fileName} has been uploaded successfully!`);
          setMessage('');
          setFileName('');
        },
      });
      setUpload(tusUpload);
      tusUpload.start();
    })
    .catch(err => {
        console.error("Error preparing upload:", err);
        setIsUploading(false);
        setMessage('Could not prepare upload. Check function logs.');
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
    <>
      {notification && (
        <div className="fixed top-5 right-5 rounded-xl border border-green-500/30 bg-green-900/50 backdrop-blur-lg shadow-2xl p-4 max-w-sm w-full text-white text-center z-50">
          {notification}
        </div>
      )}
      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl">
        <div className="p-8 space-y-6">
          <div>
              <label htmlFor="file-upload" className="cursor-pointer w-full h-12 px-6 bg-sky-500 text-white hover:bg-sky-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold">
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
              <p className="text-center text-xs text-white/60 mt-3">
                  Supported formats: MP4, MKV. Max size: 4GB.
              </p>
              {fileName && !isUploading && <p className="text-center text-sm text-white/80 mt-2">Selected: {fileName}</p>}
          </div>
          
          {isUploading && (
            <div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div className="bg-white h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-center text-sm text-white/80 mt-2">{uploadProgress}%</p>
              <div className="mt-4 flex justify-center">
                  <button onClick={handleCancel} className="h-10 px-6 bg-red-600 text-white hover:bg-red-500 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium">
                    Cancel Upload
                  </button>
              </div>
            </div>
          )}

          {message && <p className="text-sm text-center text-white/80">{message}</p>}
        </div>
      </div>
    </>
  );
}

export default UploadPanel;
