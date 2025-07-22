// File: netlify/functions/manage-users.js
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const getUsers = async () => {
    try {
        const getCommand = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: 'users.json' });
        const response = await s3Client.send(getCommand);
        return JSON.parse(await response.Body.transformToString());
    } catch (error) {
        // If the users.json file doesn't exist yet, return an empty array.
        if (error.name === 'NoSuchKey') return [];
        throw error;
    }
};

const saveUsers = async (users) => {
    const putCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: 'users.json',
        Body: JSON.stringify(users, null, 2),
        ContentType: 'application/json',
    });
    await s3Client.send(putCommand);
};

exports.handler = async (event) => {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) return { statusCode: 401 };
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) return { statusCode: 403 };

        let users = await getUsers();

        if (event.httpMethod === 'GET') {
            // Return users without their password hashes for security
            return { statusCode: 200, body: JSON.stringify(users.map(u => ({ username: u.username, roles: u.roles }))) };
        }

        if (event.httpMethod === 'POST') {
            const { username, password, roles } = JSON.parse(event.body);
            if (users.some(u => u.username === username)) {
                return { statusCode: 409, body: 'User already exists' };
            }
            const passwordHash = bcrypt.hashSync(password, 10);
            users.push({ username, passwordHash, roles });
            await saveUsers(users);
            return { statusCode: 201, body: 'User created' };
        }

        if (event.httpMethod === 'DELETE') {
            const { username } = JSON.parse(event.body);
            // Prevent deleting the last admin user
            const userToDelete = users.find(u => u.username === username);
            const adminCount = users.filter(u => u.roles.includes('Founders')).length;
            if (userToDelete && userToDelete.roles.includes('Founders') && adminCount <= 1) {
                return { statusCode: 400, body: 'Cannot delete the last admin user.' };
            }
            
            const filteredUsers = users.filter(u => u.username !== username);
            await saveUsers(filteredUsers);
            return { statusCode: 200, body: 'User deleted' };
        }

        return { statusCode: 405 };
    } catch (error) {
        console.error("User management error:", error);
        return { statusCode: 500 };
    }
};

