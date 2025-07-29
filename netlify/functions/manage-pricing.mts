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

const getPricingPlans = async () => {
    try {
        const getCommand = new GetObjectCommand({ 
            Bucket: Netlify.env.get('R2_BUCKET_NAME')!, 
            Key: 'pricing-plans.json' 
        });
        const response = await s3Client.send(getCommand);
        return JSON.parse(await response.Body!.transformToString());
    } catch (error: any) {
        if (error.name === 'NoSuchKey') {
            // Return default pricing plans if none exist
            return [
                {
                    id: 'free',
                    name: 'Free Plan',
                    price: 0.00,
                    currency: 'USD',
                    interval: 'month',
                    features: [
                        'Basic VoD Upload',
                        'Community Access',
                        'Basic Analytics'
                    ],
                    color: 'green',
                    popular: false,
                    description: 'Get started with basic features',
                    buttonText: 'Subscribe'
                },
                {
                    id: 'individual',
                    name: 'Individual Plan',
                    price: 26.99,
                    currency: 'USD',
                    interval: 'month',
                    features: [
                        'Priority VoD Review',
                        '1-on-1 Coaching Sessions',
                        'Detailed Analytics',
                        'Custom Training Plans'
                    ],
                    color: 'sky',
                    popular: true,
                    description: 'Perfect for individual players',
                    buttonText: 'Subscribe'
                },
                {
                    id: 'team',
                    name: 'Team Plan',
                    price: 100.99,
                    currency: 'USD',
                    interval: 'month',
                    features: [
                        'Team VoD Analysis',
                        'Group Coaching Sessions',
                        'Strategy Development',
                        'Tournament Preparation'
                    ],
                    color: 'blue',
                    popular: false,
                    description: 'Designed for competitive teams',
                    buttonText: 'Subscribe'
                }
            ];
        }
        throw error;
    }
};

const savePricingPlans = async (plans: any[]) => {
    const putCommand = new PutObjectCommand({
        Bucket: Netlify.env.get('R2_BUCKET_NAME')!,
        Key: 'pricing-plans.json',
        Body: JSON.stringify(plans, null, 2),
        ContentType: 'application/json',
    });
    await s3Client.send(putCommand);
};

export default async (req: Request, context: Context) => {
    console.log("=== MANAGE PRICING FUNCTION START ===");
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
    
    // For GET requests (public pricing data), don't require authentication
    if (req.method === 'GET') {
        try {
            const plans = await getPricingPlans();
            return new Response(JSON.stringify(plans), {
                status: 200,
                headers: corsHeaders
            });
        } catch (error) {
            console.error("Get pricing plans error:", error);
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

        let plans = await getPricingPlans();

        if (req.method === 'POST') {
            const body = await req.text();
            const planData = JSON.parse(body);
            
            console.log("Creating new pricing plan:", planData.name);
            
            const newPlan = {
                id: planData.id || `plan-${Date.now()}`,
                name: planData.name,
                price: parseFloat(planData.price) || 0,
                currency: planData.currency || 'USD',
                interval: planData.interval || 'month',
                features: Array.isArray(planData.features) ? planData.features : [],
                color: planData.color || 'gray',
                popular: planData.popular || false,
                description: planData.description || '',
                buttonText: planData.buttonText || 'Subscribe',
                createdAt: new Date().toISOString()
            };
            
            plans.push(newPlan);
            await savePricingPlans(plans);
            await logActionToR2(decoded.username, 'PRICING_PLAN_CREATED', `Added new pricing plan: ${planData.name}`);
            
            console.log("Pricing plan created successfully");
            return new Response(JSON.stringify(newPlan), {
                status: 201,
                headers: corsHeaders
            });
        }

        if (req.method === 'PUT') {
            const body = await req.text();
            const planData = JSON.parse(body);
            
            console.log("Updating pricing plan:", planData.id, planData.name);
            
            const planIndex = plans.findIndex((p: any) => p.id === planData.id);
            if (planIndex === -1) {
                console.log("Pricing plan not found:", planData.id);
                return new Response(JSON.stringify({ error: 'Pricing plan not found' }), { 
                    status: 404,
                    headers: corsHeaders
                });
            }
            
            plans[planIndex] = {
                ...plans[planIndex],
                name: planData.name,
                price: parseFloat(planData.price) || 0,
                currency: planData.currency || 'USD',
                interval: planData.interval || 'month',
                features: Array.isArray(planData.features) ? planData.features : [],
                color: planData.color || 'gray',
                popular: planData.popular || false,
                description: planData.description || '',
                buttonText: planData.buttonText || 'Subscribe',
                updatedAt: new Date().toISOString()
            };
            
            await savePricingPlans(plans);
            await logActionToR2(decoded.username, 'PRICING_PLAN_UPDATED', `Updated pricing plan: ${planData.name}`);
            
            console.log("Pricing plan updated successfully");
            return new Response(JSON.stringify(plans[planIndex]), {
                status: 200,
                headers: corsHeaders
            });
        }

        if (req.method === 'DELETE') {
            const body = await req.text();
            const { id } = JSON.parse(body);
            
            console.log("Deleting pricing plan:", id);
            
            const planToDelete = plans.find((p: any) => p.id === id);
            if (!planToDelete) {
                console.log("Pricing plan not found for deletion:", id);
                return new Response(JSON.stringify({ error: 'Pricing plan not found' }), { 
                    status: 404,
                    headers: corsHeaders
                });
            }
            
            const filteredPlans = plans.filter((p: any) => p.id !== id);
            await savePricingPlans(filteredPlans);
            await logActionToR2(decoded.username, 'PRICING_PLAN_DELETED', `Deleted pricing plan: ${planToDelete.name}`);
            
            console.log("Pricing plan deleted successfully");
            return new Response(JSON.stringify({ message: 'Pricing plan deleted successfully' }), { 
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
        console.error("Pricing management error:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
            status: 500,
            headers: corsHeaders
        });
    }
};
