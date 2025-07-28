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
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return new Response('Unauthorized', { status: 401 });

  try {
    const decoded = jwt.verify(token, Netlify.env.get('JWT_SECRET')!) as any;
    if (!decoded.isCoach && !decoded.isAdmin) {
        return new Response('Forbidden', { status: 403 });
    }

    const listCommand = new ListObjectsV2Command({ 
        Bucket: Netlify.env.get('R2_BUCKET_NAME')! 
    });
    const { Contents } = await s3Client.send(listCommand);
    
    if (!Contents || Contents.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const allFiles = Contents.map(file => file.Key!);
    const videoFiles = allFiles.filter(key => !key.endsWith('.json'));

    const filesWithData = await Promise.all(
      videoFiles.map(async (key) => {
        const fileData = Contents.find(c => c.Key === key)!;
        const getCommand = new GetObjectCommand({ 
            Bucket: Netlify.env.get('R2_BUCKET_NAME')!, 
            Key: key 
        });
        const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

        return {
          key: key,
          size: fileData.Size,
          lastModified: fileData.LastModified,
          url: url,
          hasNotes: allFiles.includes(`${key}.notes.json`) // Check if a notes file exists
        };
      })
    );

    return new Response(JSON.stringify(filesWithData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("List files error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
