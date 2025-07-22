import React, { useState } from 'react';

function UploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024;
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

    try {
      // Step 1: Get the pre-signed URL from our function
      const presignedUrlResponse = await fetch('/.netlify/functions/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error('Could not get an upload URL from the server.');
      }

      const { uploadURL } = await presignedUrlResponse.json();
      setMessage(`Uploading ${file.name}...`);

      // Step 2: Upload the file directly to R2 using the pre-signed URL
      // We use XMLHttpRequest here because it has built-in upload progress tracking.
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadURL, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100;
          setUploadProgress(percentage);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setIsUploading(false);
          setNotification(`${fileName} has been uploaded successfully!`);
          setMessage('');
          setFileName('');
        } else {
          throw new Error(`Upload failed with status: ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        throw new Error('An error occurred during the upload.');
      };

      xhr.send(file);

    } catch (err) {
      console.error("Upload process failed:", err);
      setIsUploading(false);
      setMessage('Upload failed. Please check the function logs and CORS policy.');
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
              <p className="text-center text-sm text-white/80 mt-2">{uploadProgress.toFixed(0)}%</p>
            </div>
          )}

          {message && <p className="text-sm text-center text-white/80">{message}</p>}
        </div>
      </div>
    </>
  );
}

export default UploadPanel;
