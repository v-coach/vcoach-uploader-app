// File: netlify/functions/login.js
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
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

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { username, password } = JSON.parse(event.body);

    try {
        const getCommand = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: 'users.json' });
        const response = await s3Client.send(getCommand);
        const users = JSON.parse(await response.Body.transformToString());

        const user = users.find(u => u.username === username);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return { statusCode: 401, body: JSON.stringify({ message: 'Invalid username or password' }) };
        }

        const isCoach = user.roles.includes('Coach') || user.roles.includes('Head Coach');
        const isAdmin = user.roles.includes('Founders');

        const token = jwt.sign(
            { username: user.username, roles: user.roles, isCoach, isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return { statusCode: 200, body: JSON.stringify({ token }) };
    } catch (error) {
        // If users.json doesn't exist, it's a valid state (no users created yet)
        if (error.name === 'NoSuchKey') {
            return { statusCode: 401, body: JSON.stringify({ message: 'Invalid username or password' }) };
        }
        console.error("Login error:", error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};

