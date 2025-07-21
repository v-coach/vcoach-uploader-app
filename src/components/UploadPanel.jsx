import React, { useState } from 'react';
import * as tus from 'tus-js-client';

function UploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [upload, setUpload] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setMessage('');

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
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6">
        <h3 className="font-semibold tracking-tight text-lg mb-4">Upload VoD</h3>
        <input 
          type="file" 
          accept="video/mp4,video/mkv" 
          onChange={handleFileChange} 
          disabled={isUploading} 
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
            <button onClick={handleCancel} className="mt-4 w-full h-10 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium">
              Cancel Upload
            </button>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-center text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

// The duplicate export has been removed from the end of the file.
export default UploadPanel;
