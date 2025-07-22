const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const jwt = require('jsonwebtoken');

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.handler = async (event) => {
  const token = event.headers.authorization?.split(' ')[1];
  
  // --- New Logging Step 1: Check if token exists ---
  console.log("Received token:", token ? "A token was received" : "No token received");

  if (!token) {
    return { statusCode: 401, body: "No token provided." };
  }

  try {
    let decoded;
    try {
      // --- New Logging Step 2: Verify the token ---
      console.log("Attempting to verify token...");
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified successfully for user:", decoded.username);
    } catch (jwtError) {
      console.error("--- JWT VERIFICATION FAILED ---");
      console.error("Error:", jwtError.message);
      return { statusCode: 401, body: "Invalid or expired token." };
    }

    if (!decoded.isCoach && !decoded.isAdmin) {
        console.log(`User ${decoded.username} denied access due to insufficient roles.`);
        return { statusCode: 403, body: "Forbidden: Insufficient roles." };
    }

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });

    const { Contents } = await s3Client.send(listCommand);
    
    if (!Contents || Contents.length === 0) {
      return { statusCode: 200, body: JSON.stringify([]) };
    }

    const filteredContents = Contents.filter(file => 
        file.Key !== 'users.json' && file.Key !== 'logs.json'
    );

    const filesWithUrls = await Promise.all(
      filteredContents.map(async (file) => {
        try {
          const getCommand = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: file.Key,
          });
          const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

          return {
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
            url: url, 
          };
        } catch (err) {
            console.error(`Failed to get signed URL for ${file.Key}:`, err);
            return null;
        }
      })
    );
    
    const validFiles = filesWithUrls.filter(file => file !== null);

    return {
      statusCode: 200,
      body: JSON.stringify(validFiles),
    };

  } catch (error) {
    console.error("--- UNEXPECTED LIST FILES ERROR ---");
    console.error("Error Message:", error.message);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
