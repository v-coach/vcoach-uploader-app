import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import jwt from 'jsonwebtoken';
import type { Context } from "@netlify/functions";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${Netlify.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: Netlify.env.get('R2_ACCESS_KEY_ID')!,
    secretAccessKey: Netlify.env.get('R2_SECRET_ACCESS_KEY')!,
  },
});

const logActionToR2 = async (user: string, action: string, details: string) => {
    const logFileKey = 'logs.json';
    let logs: any[] = [];

    try {
        const getCommand = new GetObjectCommand({ 
            Bucket: Netlify.env.get('R2_BUCKET_NAME')!, 
            Key: logFileKey 
        });
        const response = await s3Client.send(getCommand);
        const logData = await response.Body!.transformToString();
        logs = JSON.parse(logData);
    } catch (error: any) {
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
            Bucket: Netlify.env.get('R2_BUCKET_NAME')!,
            Key: logFileKey,
            Body: JSON.stringify(logs, null, 2),
            ContentType: 'application/json',
        });
        await s3Client.send(putCommand);
    } catch (error) {
        console.error("Error writing logs:", error);
    }
};

const getCoaches = async () => {
    try {
        const getCommand = new GetObjectCommand({ 
            Bucket: Netlify.env.get('R2_BUCKET_NAME')!, 
            Key: 'coaches.json' 
        });
        const response = await s3Client.send(getCommand);
        return JSON.parse(await response.Body!.transformToString());
    } catch (error: any) {
        if (error.name === 'NoSuchKey') return [];
        throw error;
    }
};

const saveCoaches = async (coaches: any[]) => {
    const putCommand = new PutObjectCommand({
        Bucket: Netlify.env.get('R2_BUCKET_NAME')!,
        Key: 'coaches.json',
        Body: JSON.stringify(coaches, null, 2),
        ContentType: 'application/json',
    });
    await s3Client.send(putCommand);
};

export default async (req: Request, context: Context) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return new Response('Unauthorized', { status: 401 });
    
    try {
        const decoded = jwt.verify(token, Netlify.env.get('JWT_SECRET')!) as any;
        if (!decoded.isAdmin) return new Response('Forbidden', { status: 403 });

        let coaches = await getCoaches();

        if (req.method === 'GET') {
            return new Response(JSON.stringify(coaches), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (req.method === 'POST') {
            const body = await req.text();
            const { name, title, description, skills, avatarColor, initials } = JSON.parse(body);
            
            const newCoach = {
                id: Date.now().toString(),
                name,
                title,
                description,
                skills: skills || [],
                avatarColor: avatarColor || 'from-sky-400 to-blue-600',
                initials: initials || name.split(' ').map((n: string) => n[0]).join(''),
                createdAt: new Date().toISOString()
            };
            
            coaches.push(newCoach);
            await saveCoaches(coaches);
            await logActionToR2(decoded.username, 'COACH_CREATED', `Added new coach: ${name}`);
            
            return new Response(JSON.stringify(newCoach), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (req.method === 'PUT') {
            const body = await req.text();
            const { id, name, title, description, skills, avatarColor, initials } = JSON.parse(body);
            
            const coachIndex = coaches.findIndex((c: any) => c.id === id);
            if (coachIndex === -1) {
                return new Response('Coach not found', { status: 404 });
            }
            
            coaches[coachIndex] = {
                ...coaches[coachIndex],
                name,
                title,
                description,
                skills: skills || [],
                avatarColor: avatarColor || coaches[coachIndex].avatarColor,
                initials: initials || name.split(' ').map((n: string) => n[0]).join(''),
                updatedAt: new Date().toISOString()
            };
            
            await saveCoaches(coaches);
            await logActionToR2(decoded.username, 'COACH_UPDATED', `Updated coach: ${name}`);
            
            return new Response(JSON.stringify(coaches[coachIndex]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (req.method === 'DELETE') {
            const body = await req.text();
            const { id } = JSON.parse(body);
            
            const coachToDelete = coaches.find((c: any) => c.id === id);
            if (!coachToDelete) {
                return new Response('Coach not found', { status: 404 });
            }
            
            const filteredCoaches = coaches.filter((c: any) => c.id !== id);
            await saveCoaches(filteredCoaches);
            await logActionToR2(decoded.username, 'COACH_DELETED', `Deleted coach: ${coachToDelete.name}`);
            
            return new Response('Coach deleted', { status: 200 });
        }

        return new Response('Method not allowed', { status: 405 });
    } catch (error) {
        console.error("Coach management error:", error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
