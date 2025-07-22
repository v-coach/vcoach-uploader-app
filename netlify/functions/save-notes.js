const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
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
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    const token = event.headers.authorization?.split(' ')[1];
    if (!token) return { statusCode: 401 };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isCoach && !decoded.isAdmin) {
            return { statusCode: 403 };
        }

        const { fileKey, notes } = JSON.parse(event.body);
        if (!fileKey || !notes) {
            return { statusCode: 400, body: 'Bad Request: fileKey and notes are required.' };
        }

        // The notes file will have the same name as the video but with a .json extension
        const notesKey = `${fileKey}.notes.json`;

        const putCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: notesKey,
            Body: JSON.stringify(notes, null, 2),
            ContentType: 'application/json',
        });

        await s3Client.send(putCommand);
        
        return { statusCode: 200, body: JSON.stringify({ message: 'Notes saved successfully' }) };

    } catch (error) {
        console.error("Save notes error:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
