import React, { useState, useEffect, useRef } from 'react';

// Main App component
const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Background and logo images
  // These paths assume the images are placed directly in the 'public' folder of your React project.
  const backgroundImage = "/V-Coach Background.jpg";
  const logoImage = "/V-Coach Uploader- Logo.jpg";

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus(''); // Clear previous status
    }
  };

  // Handle file upload to Netlify Function
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setUploadStatus('Uploading...');

    try {
      // Use FileReader to read the file content as a Data URL (base64 encoded)
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile); // This will trigger onloadend or onerror

      reader.onloadend = async () => {
        // Extract the base64 part from the Data URL (e.g., "data:image/jpeg;base64,ABCDEF...")
        const base64Content = reader.result.split(',')[1];

        // Make a POST request to your Netlify Function endpoint
        const response = await fetch('/.netlify/functions/upload-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Specify JSON content type
          },
          body: JSON.stringify({ // Send file details as JSON
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileContent: base64Content, // The base64 encoded file content
          }),
        });

        const data = await response.json(); // Parse the JSON response from the function

        if (response.ok) { // Check if the HTTP status code is 2xx
          setUploadStatus(`File "${selectedFile.name}" uploaded successfully!`);
          setSelectedFile(null); // Clear selected file after successful upload
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input element
          }
        } else {
          // If the response is not OK, throw an error with the message from the function
          throw new Error(data.message || 'Unknown error during upload.');
        }
      };

      reader.onerror = (error) => {
        // Handle errors during file reading
        console.error('FileReader error:', error);
        setUploadStatus('Failed to read file for upload.');
        setIsLoading(false); // Stop loading on FileReader error
      };

    } catch (error) {
      // Catch any errors during the fetch request or subsequent processing
      console.error('Upload failed:', error);
      setUploadStatus(`Upload failed: ${error.message || 'An unknown error occurred.'}`);
    } finally {
      // isLoading is set to false inside reader.onloadend or reader.onerror
      // to ensure it only happens after the file reading and potential upload are complete.
      // If an error occurs before reader.onloadend, it's caught by the outer try/catch.
      // So, we ensure isLoading is false here only if it wasn't already handled.
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})`, fontFamily: 'Inter, sans-serif' }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-4 border-blue-500">
        <img src={logoImage} alt="V-Coach Central Uploader Logo" className="mx-auto mb-6 w-48 h-auto rounded-full shadow-lg" />

        <h1 className="text-3xl font-bold text-gray-800 mb-6">File Uploader</h1>

        <div className="mb-6">
          <label htmlFor="file-upload" className="block text-gray-700 text-sm font-semibold mb-2">
            Select your file:
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <p className="text-gray-700 mb-4">Selected file: <span className="font-semibold">{selectedFile.name}</span></p>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          className={`w-full py-3 px-6 rounded-lg text-white font-bold text-lg transition duration-300 ease-in-out ${
            !selectedFile || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </div>
          ) : (
            'Upload File'
          )}
        </button>

        {uploadStatus && (
          <p className={`mt-4 text-sm font-medium ${uploadStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {uploadStatus}
          </p>
        )}

        {/* Instructions for deployment - will be removed in final version */}
        <div className="mt-8 text-left text-gray-600 text-sm border-t pt-4 border-gray-300">
          <h3 className="font-bold text-md mb-2">Deployment Notes:</h3>
          <p>This application is designed for Netlify deployment with Cloudflare R2 storage.</p>
          <p>You will need to implement a Netlify Function (serverless function) to handle the actual file upload to Cloudflare R2 securely.</p>
          <p>This frontend code only simulates the upload process. The backend logic for R2 interaction is crucial for a complete solution.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
