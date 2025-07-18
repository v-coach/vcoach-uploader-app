const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    if (!body || !body.filename || !body.fileData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing filename or file data' }),
      };
    }

    const buffer = Buffer.from(body.fileData, 'base64');
    const fileKey = body.filename;
    const uploader = body.uploader || 'anonymous';

    // Upload the file to R2
    await s3.putObject({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      Metadata: {
        uploadedBy: uploader,
        uploadedAt: new Date().toISOString(),
      },
    }).promise();

    // Optional: Append metadata to an "uploads.json" file
    const metaKey = 'uploads.json';
    let existingMeta = [];

    try {
      const current = await s3.getObject({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: metaKey,
      }).promise();

      existingMeta = JSON.parse(current.Body.toString());
    } catch (e) {
      if (e.code !== 'NoSuchKey') throw e;
    }

    existingMeta.push({
      filename: fileKey,
      uploadedBy: uploader,
      uploadedAt: new Date().toISOString(),
      size: buffer.length,
    });

    await s3.putObject({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: metaKey,
      Body: JSON.stringify(existingMeta, null, 2),
      ContentType: 'application/json',
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully', fileKey }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
