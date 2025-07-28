const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
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
    if (!token) return { statusCode: 401, body: 'Unauthorized' };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return { statusCode: 403, body: 'Forbidden' };
        }
        
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
            }
            // If file doesn't exist, return empty array, which is correct.
        }

        return {
            statusCode: 200,
            body: JSON.stringify(logs),
        };

    } catch (error) {
        console.error("Get logs error:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
