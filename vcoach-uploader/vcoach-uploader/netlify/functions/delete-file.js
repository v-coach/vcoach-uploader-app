const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

exports.handler = async (event) => {
  const { key } = event.queryStringParameters;

  if (!key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing file key' }),
    };
  }

  try {
    await s3.deleteObject({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Deleted: ${key}` }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
