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
    const files = (Contents || []).map(file => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
        // The placeholder has been replaced with your public R2 URL.
        url: `https://pub-be91dda7d39a4f069cc9be2f9c867baa.r2.dev/${file.Key}` 
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
