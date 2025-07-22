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
  if (!token) return { statusCode: 401 };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isCoach && !decoded.isAdmin) {
        return { statusCode: 403 };
    }

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });

    const { Contents } = await s3Client.send(listCommand);
    
    if (!Contents || Contents.length === 0) {
      return { statusCode: 200, body: JSON.stringify([]) };
    }

    // Filter out system files before mapping
    const filteredContents = Contents.filter(file => 
        file.Key !== 'users.json' && file.Key !== 'logs.json'
    );

    const filesWithUrls = await Promise.all(
      filteredContents.map(async (file) => {
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
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(filesWithUrls),
    };

  } catch (error) {
    console.error("List files error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
