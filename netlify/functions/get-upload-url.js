exports.handler = async (event) => {
  // This function is for debugging only.
  // It checks if the frontend is successfully calling the backend.

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const { fileName } = JSON.parse(event.body);
    console.log(`SUCCESS: Received request to generate URL for: ${fileName}`);

    // Return a successful response with a fake URL
    return {
      statusCode: 200,
      body: JSON.stringify({ 
          message: "Function is working correctly!",
          uploadURL: "https://fake-url.com/upload" 
      }),
    };

  } catch (error) {
    console.error("--- DEBUG FUNCTION FAILED ---");
    console.error("Error:", error.message);
    return { 
      statusCode: 500, 
      body: "The debug function itself failed. Check the logs."
    };
  }
};
