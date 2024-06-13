import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { url } from 'inspector';


const bucketName:string = process.env.BUCKET_NAME!;
const bukcetReigion:string = process.env.BUCKET_REGION!;
const s3Client = new S3Client({ region: bukcetReigion});

// const { S3Client, PutObjectCommand } = require(‘@aws-sdk/client-s3’);

export async function handleGetRequest(event:any) {
    // Process the event received:
    const fileName = event.queryStringParameters.fileName;
    let body;
    let statusCode = 200;
    console.log(event);
    try {
        const params: PutObjectCommandInput = {
          Bucket: bucketName,
          Key: fileName,
          ContentType: 'application/octet-stream'
        };
        
        // Generate pre-signed URL
        const command = new PutObjectCommand(params);
        const url = await (getSignedUrl(s3Client, command, { expiresIn: 3600 }));
        console.log("3" + url);

        body = url;
        return {
          statusCode: statusCode,
          headers: { "Content-Type": "application/json",'Access-Control-Allow-Origin': 'http://localhost:3000' },
          body: JSON.stringify({url: url, bucket: bucketName}),
        };
      } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        return {
          statusCode: 500,
          body: 'Error generating pre-signed URL' 
        }
      }
};
