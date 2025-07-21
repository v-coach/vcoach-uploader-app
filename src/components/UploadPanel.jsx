import React, { useState } from 'react';
import * as tus from 'tus-js-client';

function UploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [upload, setUpload] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // 1. Get a pre-signed upload URL from our Netlify function
    fetch('/.netlify/functions/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, contentType: file.type }),
    })
    .then(res => res.json())
    .then(({ uploadURL }) => {
      // 2. Use tus-js-client to upload directly to R2
      const tusUpload = new tus.Upload(file, {
        endpoint: uploadURL, // This is the pre-signed URL from R2
        retryDelays: [0, 3000, 5000, 10000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.error("Failed because: ", error);
          setIsUploading(false);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress(percentage);
        },
        onSuccess: () => {
          console.log("Upload finished:", tusUpload.url);
          setIsUploading(false);
          alert("Upload complete!");
        },
      });

      setUpload(tusUpload);
      tusUpload.start();
    })
    .catch(err => {
        console.error("Error getting upload URL:", err);
        setIsUploading(false);
    });
  };

  const handleCancel = () => {
    if (upload) {
      upload.abort();
      setIsUploading(false);
      setUploadProgress(0);
      console.log("Upload canceled.");
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Upload Your VoD</h2>
      <input type="file" accept="video/mp4,video/mkv" onChange={handleFileChange} disabled={isUploading} />
      
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p className="text-center mt-1">{uploadProgress}%</p>
          <button onClick={handleCancel} className="mt-2 w-full bg-red-600 hover:bg-red-700 p-2 rounded">
            Cancel Upload
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadPanel;