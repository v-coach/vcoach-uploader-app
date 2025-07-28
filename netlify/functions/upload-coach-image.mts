import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

export default async (req: Request, context: Context) => {
  console.log("=== COACH IMAGE UPLOAD FUNCTION START ===");
  console.log("HTTP Method:", req.method);
  
  if (req.method !== 'POST') {
    console.log("Method not allowed:", req.method);
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Check authentication
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, Netlify.env.get('JWT_SECRET')!) as any;
    if (!decoded.isAdmin) {
      return new Response('Forbidden', { status: 403 });
    }

    console.log("Admin authentication verified");

    // Parse request body
    const body = await req.text();
    if (!body) {
      console.error("No request body provided");
      return new Response(JSON.stringify({ error: 'Missing request body' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let fileName: string, contentType: string, coachId: string;
    try {
      const parsed = JSON.parse(body);
      fileName = parsed.fileName;
      contentType = parsed.contentType;
      coachId = parsed.coachId;
      console.log("Parsed fileName:", fileName);
      console.log("Parsed contentType:", contentType);
      console.log("Parsed coachId:", coachId);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!fileName || !contentType || !coachId) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ 
        error: 'fileName, contentType, and coachId are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("File type validation passed");
    
    // Get file extension
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Create unique filename for coach profile
    const uniquePrefix = Date.now();
    const finalKey = `coaches/profile-${coachId}-${uniquePrefix}.${extension}`;
    console.log("Final key:", finalKey);

    const command = new PutObjectCommand({
      Bucket: Netlify.env.get('R2_BUCKET_NAME')!,
      Key: finalKey,
      ContentType: contentType,
    });

    console.log("Generating signed URL...");
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Signed URL generated successfully");

    // Return both upload URL and the final key for storing in coach data
    return new Response(JSON.stringify({ 
      uploadURL, 
      imageKey: finalKey,
      publicUrl: `https://${Netlify.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com/${Netlify.env.get('R2_BUCKET_NAME')}/${finalKey}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("=== DETAILED COACH IMAGE UPLOAD ERROR ===");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      message: "Failed to generate pre-signed URL for coach image upload.",
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
