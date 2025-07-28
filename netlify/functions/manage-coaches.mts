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
    console.log("=== MANAGE COACHES FUNCTION START ===");
    console.log("Method:", req.method);
    
    // CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('', {
            status: 200,
            headers: corsHeaders
        });
    }
    
    // For GET requests (public coach data), don't require authentication
    if (req.method === 'GET') {
        try {
            const coaches = await getCoaches();
            return new Response(JSON.stringify(coaches), {
                status: 200,
                headers: corsHeaders
            });
        } catch (error) {
            console.error("Get coaches error:", error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
                status: 500,
                headers: corsHeaders
            });
        }
    }

    // For all other methods, require admin authentication
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    console.log("Auth header present:", !!authHeader);
    console.log("Token present:", !!token);
    
    if (!token) {
        console.log("No token provided");
        return new Response(JSON.stringify({ error: 'Unauthorized - No token provided' }), { 
            status: 401,
            headers: corsHeaders
        });
    }
    
    try {
        const decoded = jwt.verify(token, Netlify.env.get('JWT_SECRET')!) as any;
        console.log("Token decoded successfully:", { username: decoded.username, isAdmin: decoded.isAdmin });
        
        if (!decoded.isAdmin) {
            console.log("User is not admin");
            return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { 
                status: 403,
                headers: corsHeaders
            });
        }

        let coaches = await getCoaches();

        if (req.method === 'POST') {
            const body = await req.text();
            const coachData = JSON.parse(body);
            
            console.log("Creating new coach:", coachData.name);
            console.log("Coach data received:", coachData);
            
            const newCoach = {
                id: Date.now().toString(),
                name: coachData.name,
                title: coachData.title,
                description: coachData.description || '', // Preserve spaces and formatting
                skills: Array.isArray(coachData.skills) ? coachData.skills : [],
                avatarColor: coachData.avatarColor || 'from-sky-400 to-blue-600',
                initials: coachData.initials || coachData.name.split(' ').map((n: string) => n[0]).join(''),
                profileImage: coachData.profileImage || null,
                // Social media support - handle both formats
                socialMedia: coachData.socialMedia || {
                    twitter: coachData.twitter_url || '',
                    instagram: coachData.instagram_url || '',
                    youtube: coachData.youtube_url || '',
                    twitch: coachData.twitch_url || '',
                    discord: coachData.discord_url || ''
                },
                // Individual social media fields for backward compatibility
                twitter_url: coachData.socialMedia?.twitter || coachData.twitter_url || '',
                instagram_url: coachData.socialMedia?.instagram || coachData.instagram_url || '',
                youtube_url: coachData.socialMedia?.youtube || coachData.youtube_url || '',
                twitch_url: coachData.socialMedia?.twitch || coachData.twitch_url || '',
                discord_url: coachData.socialMedia?.discord || coachData.discord_url || '',
                // Additional fields
                bio: coachData.bio || '',
                experience: coachData.experience || '',
                rank_peak: coachData.rank_peak || coachData.rankPeak || '',
                rank_current: coachData.rank_current || coachData.rankCurrent || '',
                specialties: Array.isArray(coachData.specialties) ? coachData.specialties : [],
                region: coachData.region || '',
                timezone: coachData.timezone || '',
                hourly_rate: coachData.hourly_rate || coachData.hourlyRate || null,
                languages: Array.isArray(coachData.languages) ? coachData.languages : [],
                createdAt: new Date().toISOString()
            };
            
            coaches.push(newCoach);
            await saveCoaches(coaches);
            await logActionToR2(decoded.username, 'COACH_CREATED', `Added new coach: ${coachData.name}`);
            
            console.log("Coach created successfully");
            return new Response(JSON.stringify(newCoach), {
                status: 201,
                headers: corsHeaders
            });
        }

        if (req.method === 'PUT') {
            const body = await req.text();
            const coachData = JSON.parse(body);
            
            console.log("Updating coach:", coachData.id, coachData.name);
            console.log("Update data received:", coachData);
            
            const coachIndex = coaches.findIndex((c: any) => c.id === coachData.id);
            if (coachIndex === -1) {
                console.log("Coach not found:", coachData.id);
                return new Response(JSON.stringify({ error: 'Coach not found' }), { 
                    status: 404,
                    headers: corsHeaders
                });
            }
            
            coaches[coachIndex] = {
                ...coaches[coachIndex],
                name: coachData.name,
                title: coachData.title,
                description: coachData.description !== undefined ? coachData.description : coaches[coachIndex].description, // Preserve formatting
                skills: Array.isArray(coachData.skills) ? coachData.skills : coaches[coachIndex].skills || [],
                avatarColor: coachData.avatarColor || coaches[coachIndex].avatarColor,
                initials: coachData.initials || coachData.name.split(' ').map((n: string) => n[0]).join(''),
                profileImage: coachData.profileImage !== undefined ? coachData.profileImage : coaches[coachIndex].profileImage,
                // Social media support - handle both formats
                socialMedia: coachData.socialMedia || {
                    twitter: coachData.twitter_url || coaches[coachIndex].twitter_url || '',
                    instagram: coachData.instagram_url || coaches[coachIndex].instagram_url || '',
                    youtube: coachData.youtube_url || coaches[coachIndex].youtube_url || '',
                    twitch: coachData.twitch_url || coaches[coachIndex].twitch_url || '',
                    discord: coachData.discord_url || coaches[coachIndex].discord_url || ''
                },
                // Individual social media fields for backward compatibility
                twitter_url: coachData.socialMedia?.twitter || coachData.twitter_url || coaches[coachIndex].twitter_url || '',
                instagram_url: coachData.socialMedia?.instagram || coachData.instagram_url || coaches[coachIndex].instagram_url || '',
                youtube_url: coachData.socialMedia?.youtube || coachData.youtube_url || coaches[coachIndex].youtube_url || '',
                twitch_url: coachData.socialMedia?.twitch || coachData.twitch_url || coaches[coachIndex].twitch_url || '',
                discord_url: coachData.socialMedia?.discord || coachData.discord_url || coaches[coachIndex].discord_url || '',
                // Additional fields
                bio: coachData.bio !== undefined ? coachData.bio : coaches[coachIndex].bio || '',
                experience: coachData.experience !== undefined ? coachData.experience : coaches[coachIndex].experience || '',
                rank_peak: coachData.rank_peak || coachData.rankPeak || coaches[coachIndex].rank_peak || '',
                rank_current: coachData.rank_current || coachData.rankCurrent || coaches[coachIndex].rank_current || '',
                specialties: Array.isArray(coachData.specialties) ? coachData.specialties : coaches[coachIndex].specialties || [],
                region: coachData.region !== undefined ? coachData.region : coaches[coachIndex].region || '',
                timezone: coachData.timezone !== undefined ? coachData.timezone : coaches[coachIndex].timezone || '',
                hourly_rate: coachData.hourly_rate !== undefined ? coachData.hourly_rate : (coachData.hourlyRate !== undefined ? coachData.hourlyRate : coaches[coachIndex].hourly_rate),
                languages: Array.isArray(coachData.languages) ? coachData.languages : coaches[coachIndex].languages || [],
                updatedAt: new Date().toISOString()
            };
            
            await saveCoaches(coaches);
            await logActionToR2(decoded.username, 'COACH_UPDATED', `Updated coach: ${coachData.name}`);
            
            console.log("Coach updated successfully");
            return new Response(JSON.stringify(coaches[coachIndex]), {
                status: 200,
                headers: corsHeaders
            });
        }

        if (req.method === 'DELETE') {
            const body = await req.text();
            const { id } = JSON.parse(body);
            
            console.log("Deleting coach:", id);
            
            const coachToDelete = coaches.find((c: any) => c.id === id);
            if (!coachToDelete) {
                console.log("Coach not found for deletion:", id);
                return new Response(JSON.stringify({ error: 'Coach not found' }), { 
                    status: 404,
                    headers: corsHeaders
                });
            }
            
            const filteredCoaches = coaches.filter((c: any) => c.id !== id);
            await saveCoaches(filteredCoaches);
            await logActionToR2(decoded.username, 'COACH_DELETED', `Deleted coach: ${coachToDelete.name}`);
            
            console.log("Coach deleted successfully");
            return new Response(JSON.stringify({ message: 'Coach deleted successfully' }), { 
                status: 200,
                headers: corsHeaders
            });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
            status: 405,
            headers: corsHeaders
        });
        
    } catch (error: any) {
        console.error("JWT verification failed:", error);
        if (error.name === 'JsonWebTokenError') {
            return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), { 
                status: 401,
                headers: corsHeaders
            });
        }
        if (error.name === 'TokenExpiredError') {
            return new Response(JSON.stringify({ error: 'Unauthorized - Token expired' }), { 
                status: 401,
                headers: corsHeaders
            });
        }
        console.error("Coach management error:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
            status: 500,
            headers: corsHeaders
        });
    }
};
