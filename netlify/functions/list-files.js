const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
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
  if (!token) return { statusCode: 401, body: 'Unauthorized' };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isCoach && !decoded.isAdmin) {
      return { statusCode: 403, body: 'Forbidden' };
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });

    const { Contents } = await s3Client.send(command);
    const files = (Contents || []).map(file => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
        url: `https://<YOUR_R2_PUBLIC_URL>/${file.Key}` // IMPORTANT: Set your public R2 URL
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
