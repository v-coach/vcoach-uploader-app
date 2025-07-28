import React, { useState, useEffect } from 'react';

function UploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState('');
  const [uploadController, setUploadController] = useState(null);

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

    // Get pre-signed URL from Netlify function
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
    .then(({ uploadURL, key }) => {
      setMessage(`Uploading ${file.name}...`);
      
      // Create AbortController for cancellation
      const controller = new AbortController();
      setUploadController(controller);

      // Create a ReadableStream to track upload progress
      let uploadedBytes = 0;
      const totalBytes = file.size;

      const trackingStream = new ReadableStream({
        start(controller) {
          const reader = file.stream().getReader();
          
          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              
              uploadedBytes += value.byteLength;
              const percentage = (uploadedBytes / totalBytes) * 100;
              setUploadProgress(percentage.toFixed(2));
              
              controller.enqueue(value);
              return pump();
            });
          }
          
          return pump();
        }
      });

      // Upload using fetch with the pre-signed URL
      fetch(uploadURL, {
        method: 'PUT',
        body: trackingStream,
        headers: {
          'Content-Type': file.type,
        },
        signal: controller.signal,
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }
        
        setIsUploading(false);
        setNotification(`${fileName} has been uploaded successfully!`);
        setMessage('');
        setFileName('');
        setUploadController(null);
        e.target.value = null; // Reset file input
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          setMessage('Upload canceled.');
        } else {
          console.error("Upload failed:", error);
          setMessage('Upload failed. Please try again.');
        }
        setIsUploading(false);
        setUploadController(null);
      });
    })
    .catch(err => {
        console.error("Error preparing upload:", err);
        setIsUploading(false);
        setMessage('Could not prepare upload. Check function logs.');
        setUploadController(null);
    });
  };

  const handleCancel = () => {
    if (uploadController) {
      uploadController.abort();
      setIsUploading(false);
      setMessage('Upload canceled.');
      setFileName('');
      setUploadController(null);
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
                accept="video/mp4,video/mkv,video/avi,video/mov" 
                onChange={handleFileChange} 
                disabled={isUploading} 
              />
              <p className="text-center text-xs text-white/60 mt-3">
                  Supported formats: MP4, MKV, AVI, MOV. Max size: 4GB.
              </p>
              {fileName && !isUploading && <p className="text-center text-sm text-white/80 mt-2">Selected: {fileName}</p>}
          </div>
          
          {isUploading && (
            <div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
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
