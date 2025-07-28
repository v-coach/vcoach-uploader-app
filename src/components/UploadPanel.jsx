import React, { useState, useEffect } from 'react';

function UploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState('');
  const [uploadController, setUploadController] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addDebugInfo = (info) => {
    console.log(info);
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDebugInfo(''); // Clear previous debug info
    addDebugInfo(`File selected: ${file.name} (${file.size} bytes)`);

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
    addDebugInfo('Requesting pre-signed URL...');

    // Get pre-signed URL from Netlify function
    fetch('/.netlify/functions/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, contentType: file.type }),
    })
    .then(res => {
        addDebugInfo(`Pre-signed URL response status: ${res.status}`);
        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }
        return res.json();
    })
    .then(({ uploadURL, key }) => {
      addDebugInfo(`Pre-signed URL received. Key: ${key}`);
      addDebugInfo(`Upload URL length: ${uploadURL.length}`);
      setMessage(`Uploading ${file.name}...`);
      
      // Create AbortController for cancellation
      const controller = new AbortController();
      setUploadController(controller);

      // Simple progress simulation since we can't track real progress with pre-signed URLs
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress < 90) {
          setUploadProgress(progress.toFixed(2));
        }
      }, 200);

      addDebugInfo('Starting file upload to R2...');

      // Upload using fetch with the pre-signed URL
      fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        signal: controller.signal,
      })
      .then(response => {
        clearInterval(progressInterval);
        addDebugInfo(`Upload response status: ${response.status}`);
        addDebugInfo(`Upload response headers: ${JSON.stringify([...response.headers.entries()])}`);
        
        if (!response.ok) {
          return response.text().then(text => {
            addDebugInfo(`Upload error response body: ${text}`);
            throw new Error(`Upload failed with status ${response.status}: ${text}`);
          });
        }
        
        setUploadProgress(100);
        setIsUploading(false);
        setNotification(`${fileName} has been uploaded successfully!`);
        setMessage('Upload completed successfully!');
        addDebugInfo('Upload completed successfully!');
        setFileName('');
        setUploadController(null);
        e.target.value = null; // Reset file input
      })
      .catch(error => {
        clearInterval(progressInterval);
        if (error.name === 'AbortError') {
          setMessage('Upload canceled.');
          addDebugInfo('Upload was canceled by user');
        } else {
          console.error("Upload failed:", error);
          setMessage(`Upload failed: ${error.message}`);
          addDebugInfo(`Upload failed: ${error.message}`);
        }
        setIsUploading(false);
        setUploadController(null);
      });
    })
    .catch(err => {
        console.error("Error preparing upload:", err);
        setIsUploading(false);
        setMessage(`Could not prepare upload: ${err.message}`);
        addDebugInfo(`Failed to get pre-signed URL: ${err.message}`);
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
          
          {/* Debug Information */}
          {debugInfo && (
            <div className="mt-4 p-4 bg-black/50 rounded-lg">
              <h4 className="text-sm font-bold text-white mb-2">Debug Info:</h4>
              <pre className="text-xs text-green-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {debugInfo}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UploadPanel;
