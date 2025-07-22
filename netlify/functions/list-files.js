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

    const listCommand = new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME });
    const { Contents } = await s3Client.send(listCommand);
    
    if (!Contents || Contents.length === 0) {
      return { statusCode: 200, body: JSON.stringify([]) };
    }

    const allFiles = Contents.map(file => file.Key);
    const videoFiles = allFiles.filter(key => !key.endsWith('.json'));

    const filesWithData = await Promise.all(
      videoFiles.map(async (key) => {
        const fileData = Contents.find(c => c.Key === key);
        const getCommand = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key });
        const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

        return {
          key: key,
          size: fileData.Size,
          lastModified: fileData.LastModified,
          url: url,
          hasNotes: allFiles.includes(`${key}.notes.json`) // Check if a notes file exists
        };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(filesWithData),
    };

  } catch (error) {
    console.error("List files error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
