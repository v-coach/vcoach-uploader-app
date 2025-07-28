const { S3Client, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const jwt = require('jsonwebtoken');

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const logActionToR2 = async (user, action, details) => {
    const logFileKey = 'logs.json';
    let logs = [];
    try {
        const getCommand = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: logFileKey });
        const response = await s3Client.send(getCommand);
        logs = JSON.parse(await response.Body.transformToString());
    } catch (error) {
        if (error.name !== 'NoSuchKey') console.error("Error fetching logs:", error);
    }
    logs.unshift({ id: Date.now(), timestamp: new Date().toISOString(), user, action, details });
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
    if (!token) return { statusCode: 401, body: 'Unauthorized' };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isCoach && !decoded.isAdmin) {
            return { statusCode: 403, body: 'Forbidden' };
        }

        const { oldKey, newKey } = JSON.parse(event.body);
        if (!oldKey || !newKey) {
            return { statusCode: 400, body: 'Bad Request' };
        }

        const copyCommand = new CopyObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            CopySource: `${process.env.R2_BUCKET_NAME}/${oldKey}`,
            Key: newKey,
        });
        await s3Client.send(copyCommand);

        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: oldKey,
        });
        await s3Client.send(deleteCommand);

        // Log the action to R2
        await logActionToR2(decoded.username, 'RENAME', `Renamed file from '${oldKey}' to '${newKey}'`);

        return { statusCode: 200, body: JSON.stringify({ message: 'File renamed' }) };

    } catch (error) {
        console.error("Rename file error:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
