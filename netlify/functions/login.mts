import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Context } from "@netlify/functions";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${Netlify.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: Netlify.env.get('R2_ACCESS_KEY_ID')!,
    secretAccessKey: Netlify.env.get('R2_SECRET_ACCESS_KEY')!,
  },
});

export default async (req: Request, context: Context) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }
    
    const body = await req.text();
    const { username, password } = JSON.parse(body);

    try {
        const getCommand = new GetObjectCommand({ 
            Bucket: Netlify.env.get('R2_BUCKET_NAME')!, 
            Key: 'users.json' 
        });
        const response = await s3Client.send(getCommand);
        const users = JSON.parse(await response.Body.transformToString());

        const user = users.find((u: any) => u.username === username);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return new Response(JSON.stringify({ message: 'Invalid username or password' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const isCoach = user.roles.includes('Coach') || user.roles.includes('Head Coach');
        const isAdmin = user.roles.includes('Founders');

        const token = jwt.sign(
            { username: user.username, roles: user.roles, isCoach, isAdmin },
            Netlify.env.get('JWT_SECRET')!,
            { expiresIn: '1d' }
        );

        return new Response(JSON.stringify({ token }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        if (error.name === 'NoSuchKey') {
            return new Response(JSON.stringify({ 
                message: 'No users have been created yet. Please contact an administrator.' 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        console.error("Login error:", error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
