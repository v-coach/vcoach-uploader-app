const { S3Client, CopyObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    // --- AUTHENTICATION DISABLED FOR TESTING ---

    try {
        const { oldKey, newKey } = JSON.parse(event.body);
        if (!oldKey || !newKey) {
            return { statusCode: 400, body: 'Bad Request: oldKey and newKey are required.' };
        }

        // Step 1: Copy the object to the new key
        const copyCommand = new CopyObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            CopySource: `${process.env.R2_BUCKET_NAME}/${oldKey}`,
            Key: newKey,
        });
        await s3Client.send(copyCommand);

        // Step 2: Delete the original object
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: oldKey,
        });
        await s3Client.send(deleteCommand);

        return { statusCode: 200, body: JSON.stringify({ message: 'File renamed successfully' }) };

    } catch (error) {
        console.error("Rename file error:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
