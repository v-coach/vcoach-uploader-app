const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const bcrypt = require('bcryptjs');

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.handler = async () => {
    try {
        // Check if the users.json file already exists
        await s3Client.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: 'users.json' }));
        return {
            statusCode: 409, // Conflict
            body: 'Setup has already been completed. This function can only be run once. Please delete this function file for security.',
        };
    } catch (error) {
        // If the file doesn't exist (NoSuchKey), that's good. We can proceed.
        if (error.name !== 'NoSuchKey') {
            console.error("Error checking for users file:", error);
            return { statusCode: 500, body: 'An error occurred.' };
        }
    }

    // If the file doesn't exist, create the default admin user
    try {
        const defaultAdmin = {
            username: 'matthew.langton@csoesports.com',
            passwordHash: bcrypt.hashSync('Pr0m3thius@9911', 10),
            roles: ['Founders']
        };
        
        const putCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: 'users.json',
            Body: JSON.stringify([defaultAdmin], null, 2),
            ContentType: 'application/json',
        });
        await s3Client.send(putCommand);

        return {
            statusCode: 200,
            body: 'Successfully created the default admin user. Please delete this function file now for security.',
        };
    } catch (setupError) {
        console.error("Error setting up admin user:", setupError);
        return { statusCode: 500, body: 'Failed to create admin user.' };
    }
};
