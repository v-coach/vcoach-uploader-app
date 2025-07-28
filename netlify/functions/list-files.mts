import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
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
  console.log("=== LIST FILES FUNCTION START ===");
  
  const authHeader = req.headers.get('authorization');
  console.log("Auth header present:", !!authHeader);
  
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log("No token provided");
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, Netlify.env.get('JWT_SECRET')!) as any;
    console.log("Token decoded successfully:", { username: decoded.username, roles: decoded.roles });
    
    if (!decoded.isCoach && !decoded.isAdmin) {
        console.log("User does not have required permissions");
        return new Response('Forbidden', { status: 403 });
    }

    console.log("Starting S3 list objects command...");
    const listCommand = new ListObjectsV2Command({ 
        Bucket: Netlify.env.get('R2_BUCKET_NAME')! 
    });
    const { Contents } = await s3Client.send(listCommand);
    
    console.log("S3 list completed. Number of objects:", Contents?.length || 0);
    
    if (!Contents || Contents.length === 0) {
      console.log("No files found in bucket");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const allFiles = Contents.map(file => file.Key!);
    console.log("All files in bucket:", allFiles);
    
    const videoFiles = allFiles.filter(key => 
      !key.endsWith('.json') && 
      !key.includes('users.json') && 
      !key.includes('logs.json')
    );
    console.log("Video files found:", videoFiles);

    console.log("Generating signed URLs for video files...");
    const filesWithData = await Promise.all(
      videoFiles.map(async (key) => {
        try {
          const fileData = Contents.find(c => c.Key === key)!;
          const getCommand = new GetObjectCommand({ 
              Bucket: Netlify.env.get('R2_BUCKET_NAME')!, 
              Key: key 
          });
          const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
          
          const hasNotes = allFiles.includes(`${key}.notes.json`);
          console.log(`File: ${key}, Size: ${fileData.Size}, HasNotes: ${hasNotes}`);

          return {
            key: key,
            size: fileData.Size,
            lastModified: fileData.LastModified,
            url: url,
            hasNotes: hasNotes
          };
        } catch (error) {
          console.error(`Error processing file ${key}:`, error);
          return null;
        }
      })
    );

    const validFiles = filesWithData.filter(file => file !== null);
    console.log("Valid files with URLs generated:", validFiles.length);

    return new Response(JSON.stringify(validFiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("=== LIST FILES ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return new Response("Internal Server Error", { status: 500 });
  }
};
