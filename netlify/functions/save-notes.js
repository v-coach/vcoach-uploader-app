const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const jwt = require('jsonwebtoken');

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Helper function to manage logging to an R2 JSON file
const logActionToR2 = async (user, action, details) => {
    const logFileKey = 'logs.json';
    let logs = [];

    try {
        const getCommand = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: logFileKey });
        const response = await s3Client.send(getCommand);
        const logData = await response.Body.transformToString();
        logs = JSON.parse(logData);
    } catch (error) {
        if (error.name !== 'NoSuchKey') {
            console.error("Error fetching logs:", error);
            return; 
        }
    }

    logs.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        user,
        action,
        details,
    });

    try {
        const putCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: logFileKey,
            Body: JSON.stringify(logs, null, 2),
            ContentType: 'application/json',
        });
        await s3Client.send(putCommand);
    } catch (error) {
        console.error("Error writing logs:", error);
    }
};

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
        if (!fileKey || notes === undefined) {
            return { statusCode: 400, body: 'Bad Request: fileKey and notes are required.' };
        }

        const notesKey = `${fileKey}.notes.json`;

        const putCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: notesKey,
            Body: JSON.stringify(notes, null, 2),
            ContentType: 'application/json',
        });

        await s3Client.send(putCommand);
        
        // Log the action to R2
        await logActionToR2(decoded.username, 'NOTES_UPDATED', `Updated notes for file: ${fileKey}`);

        return { statusCode: 200, body: JSON.stringify({ message: 'Notes saved successfully' }) };

    } catch (error) {
        console.error("Save notes error:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
