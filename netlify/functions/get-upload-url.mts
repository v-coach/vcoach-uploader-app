import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
  console.log("=== FUNCTION START ===");
  console.log("HTTP Method:", req.method);
  
  if (req.method !== 'POST') {
    console.log("Method not allowed:", req.method);
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Check environment variables
    const requiredEnvVars = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !Netlify.env.get(varName));
    
    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars);
      return new Response(JSON.stringify({ 
        error: "Configuration Error", 
        message: `Missing environment variables: ${missingVars.join(', ')}` 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("Environment variables check passed");
    console.log("Account ID:", Netlify.env.get('CLOUDFLARE_ACCOUNT_ID'));
    console.log("Bucket name:", Netlify.env.get('R2_BUCKET_NAME'));

    // Parse request body
    const body = await req.text();
    if (!body) {
      console.error("No request body provided");
      return new Response(JSON.stringify({ error: 'Missing request body' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let fileName: string, contentType: string;
    try {
      const parsed = JSON.parse(body);
      fileName = parsed.fileName;
      contentType = parsed.contentType;
      console.log("Parsed fileName:", fileName);
      console.log("Parsed contentType:", contentType);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!fileName || !contentType) {
      console.error("Missing fileName or contentType");
      return new Response(JSON.stringify({ error: 'fileName and contentType are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("S3 client initialized successfully");
    
    // Sanitize the original filename to remove special characters
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    console.log("Sanitized fileName:", sanitizedFileName);
    
    // Use Date.now() to create a unique prefix
    const uniquePrefix = Date.now();
    console.log("Unique prefix:", uniquePrefix);

    // Combine the unique prefix and sanitized filename
    const finalKey = `${uniquePrefix}-${sanitizedFileName}`;
    console.log("Final key:", finalKey);

    const command = new PutObjectCommand({
      Bucket: Netlify.env.get('R2_BUCKET_NAME')!,
      Key: finalKey,
      ContentType: contentType,
    });

    console.log("Generating signed URL...");
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Signed URL generated successfully");
    console.log("Upload URL length:", uploadURL.length);

    return new Response(JSON.stringify({ uploadURL, key: finalKey }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("=== DETAILED UPLOAD URL ERROR ===");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    console.error("Error Code:", error.code);
    console.error("Error Details:", JSON.stringify(error, null, 2));
    
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      message: "Failed to generate pre-signed URL. Check function logs for details.",
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
