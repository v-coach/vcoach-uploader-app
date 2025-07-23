const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.handler = async (event) => {
  console.log("=== FUNCTION START ===");
  console.log("HTTP Method:", event.httpMethod);
  console.log("Event body:", event.body);
  
  if (event.httpMethod !== 'POST') {
    console.log("Method not allowed:", event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Check environment variables
    const requiredEnvVars = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Configuration Error", 
          message: `Missing environment variables: ${missingVars.join(', ')}` 
        })
      };
    }

    console.log("Environment variables check passed");
    console.log("Account ID:", process.env.CLOUDFLARE_ACCOUNT_ID);
    console.log("Bucket name:", process.env.R2_BUCKET_NAME);

    // Parse request body
    if (!event.body) {
      console.error("No request body provided");
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing request body' }) 
      };
    }

    let fileName, contentType;
    try {
      const parsed = JSON.parse(event.body);
      fileName = parsed.fileName;
      contentType = parsed.contentType;
      console.log("Parsed fileName:", fileName);
      console.log("Parsed contentType:", contentType);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Invalid JSON in request body' }) 
      };
    }

    if (!fileName || !contentType) {
      console.error("Missing fileName or contentType");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'fileName and contentType are required' })
      };
    }

    // Initialize S3 client
    console.log("Initializing S3 client...");
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    console.log("S3 client initialized successfully");
    
    // Sanitize the original filename to remove special characters
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    console.log("Sanitized fileName:", sanitizedFileName);
    
    // Use Date.now() to create a unique prefix
    const uniquePrefix = Date.now();
    console.log("Unique prefix:", uniquePrefix);

    // Combine the unique prefix and sanitized filename
    const finalKey = `${uniquePrefix}-${sanitizedFileName}`;
    console.log("Final key:", finalKey);

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: finalKey,
      ContentType: contentType,
    });

    console.log("Generating signed URL...");
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Signed URL generated successfully");
    console.log("Upload URL length:", uploadURL.length);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uploadURL }),
    };
  } catch (error) {
    console.error("=== DETAILED UPLOAD URL ERROR ===");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    console.error("Error Code:", error.code);
    console.error("Error Details:", JSON.stringify(error, null, 2));
    
    return { 
      statusCode: 500, 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: "Internal Server Error", 
        message: "Failed to generate pre-signed URL. Check function logs for details.",
        details: error.message
      }) 
    };
  }
};
