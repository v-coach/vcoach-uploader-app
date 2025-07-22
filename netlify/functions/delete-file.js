const { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
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

    // 1. Try to get existing logs
    try {
        const getCommand = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: logFileKey });
        const response = await s3Client.send(getCommand);
        const logData = await response.Body.transformToString();
        logs = JSON.parse(logData);
    } catch (error) {
        if (error.name !== 'NoSuchKey') {
            console.error("Error fetching logs:", error);
            // Don't block the main action if logging fails
            return; 
        }
        // If the file doesn't exist, we'll just start with an empty array
    }

    // 2. Add new log entry
    logs.unshift({
        id: Date.now(), // Simple unique ID
        timestamp: new Date().toISOString(),
        user,
        action,
        details,
    });

    // 3. Write logs back to R2
    try {
        const putCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: logFileKey,
            Body: JSON.stringify(logs, null, 2), // Pretty-print JSON
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
    if (!token) return { statusCode: 401, body: 'Unauthorized' };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isCoach && !decoded.isAdmin) {
            return { statusCode: 403, body: 'Forbidden' };
        }

        const { fileKey } = JSON.parse(event.body);
        if (!fileKey) return { statusCode: 400, body: 'Bad Request' };

        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
        });

        await s3Client.send(command);
        
        // Log the action to R2
        await logActionToR2(decoded.username, 'DELETE', `Deleted file: ${fileKey}`);

        return { statusCode: 200, body: JSON.stringify({ message: 'File deleted' }) };

    } catch (error) {
        console.error("Delete file error:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
