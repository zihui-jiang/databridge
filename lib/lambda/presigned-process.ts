import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'


const bucketName:string = process.env.BUCKET_NAME!;
const bukcetReigion:string = process.env.BUCKET_REGION!;
const s3Client = new S3Client({ region: bukcetReigion});

exports.handler = async (event:any) => {
    // Process the event received:
    const fileName = event.queryStringParameters.fileName;
    console.log(event);
    try {
        const params: PutObjectCommandInput = {
          Bucket: bucketName,
          Key: fileName,
          ContentType: 'application/octet-stream'
        };
        
        // Generate pre-signed URL
        const command = new PutObjectCommand(params);
        const url = getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        return {
          statusCode: 200,
          body: JSON.stringify({ url }),
        };
      } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error generating pre-signed URL' }),
        };
      }
};
