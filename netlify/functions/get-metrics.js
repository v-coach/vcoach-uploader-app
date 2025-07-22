const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

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

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });

    const { Contents } = await s3Client.send(command);
    
    const fileCount = Contents ? Contents.length : 0;
    const totalSize = Contents ? Contents.reduce((acc, file) => acc + file.Size, 0) : 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ totalSize, fileCount }),
    };

  } catch (error) {
    console.error("Get metrics error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
