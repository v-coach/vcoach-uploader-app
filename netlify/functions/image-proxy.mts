// netlify/functions/image-proxy.mts
export default async (req: Request, context: any) => {
  console.log("=== IMAGE PROXY FUNCTION START ===");
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers });
  }

  try {
    // Get the image URL from query parameters
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return new Response('Missing image URL parameter', { status: 400, headers });
    }

    // Validate that it's from your R2 bucket
    if (!imageUrl.includes('pub-be91dda7d39a4f969cc9be2f9c867baa.r2.dev')) {
      return new Response('Invalid image URL', { status: 400, headers });
    }

    console.log('Proxying image:', imageUrl);

    // Fetch the image from R2
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, imageResponse.statusText);
      return new Response('Image not found', { status: 404, headers });
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    console.log('Image fetched successfully, size:', imageBuffer.byteLength);

    // Return the image with proper headers
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      }
    });

  } catch (error: any) {
    console.error('Image proxy error:', error);
    return new Response('Internal server error', { status: 500, headers });
  }
};
