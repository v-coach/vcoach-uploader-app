const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

/**
 * Creates a safe, formatted timestamp string (YYYYMMDD_HHmm).
 * @returns {string} The formatted timestamp.
 */
const getSafeTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  // Creates a format like: 20250723_1102
  return `${year}${month}${day}_${hours}${minutes}`;
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const { fileName, contentType } = JSON.parse(event.body);
    
    // Sanitize the original filename to remove problematic characters
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    
    // Get the new, safer timestamp
    const timestamp = getSafeTimestamp();

    // Combine timestamp and sanitized filename for the final key
    const finalKey = `${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: finalKey, // Use the new, safe key
      ContentType: contentType,
    });

    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadURL }),
    };
  } catch (error) {
    console.error("--- DETAILED UPLOAD URL ERROR ---");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: "Internal Server Error", 
        message: "Failed to generate pre-signed URL. Check function logs for details." 
      }) 
    };
  }
};
