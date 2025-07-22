const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
// const jwt = require('jsonwebtoken'); // No longer needed for testing

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.handler = async (event) => {
  // --- AUTHENTICATION DISABLED FOR TESTING ---
  // const token = event.headers.authorization?.split(' ')[1];
  // if (!token) return { statusCode: 401, body: 'Unauthorized' };

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if (!decoded.isCoach && !decoded.isAdmin) {
    //   return { statusCode: 403, body: 'Forbidden' };
    // }

    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });

    const { Contents } = await s3Client.send(command);
    const files = (Contents || []).map(file => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
        // IMPORTANT: Replace with your public R2 URL if you have one set up
        url: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${file.Key}` 
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(files),
    };

  } catch (error) {
    console.error("List files error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
