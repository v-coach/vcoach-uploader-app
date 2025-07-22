const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
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
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    // --- AUTHENTICATION DISABLED FOR TESTING ---
    // const token = event.headers.authorization?.split(' ')[1];
    // if (!token) return { statusCode: 401, body: 'Unauthorized' };

    try {
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // if (!decoded.isCoach && !decoded.isAdmin) {
        //     return { statusCode: 403, body: 'Forbidden' };
        // }

        const { fileKey } = JSON.parse(event.body);
        if (!fileKey) return { statusCode: 400, body: 'Bad Request' };

        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
        });

        await s3Client.send(command);
        return { statusCode: 200, body: JSON.stringify({ message: 'File deleted' }) };

    } catch (error) {
        console.error("Delete file error:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
