import * as s3Client from "aws-sdk/clients/s3";
import * as dynamoClient from "aws-sdk/clients/dynamodb";
import { nanoid } from 'nanoid'
import { AWSError } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";



exports.handler = async (event:any) => {
    // Process the event received:
    console.log(event);
    const idLength = 10;
    //TODO: parameterize this via env var
    const bucketName:string = process.env.BUCKET_NAME!;
    // Generate the ID, lenght is set to 10
    let id = nanoid(idLength);
    // upload the file to S3
    await putObject(new s3Client(), bucketName, id, event.body);
    new dynamoClient().putItem(); // upload item to dynamodb;
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ message: "Hello, World!" }),
    };
};


export async function name(dynamoClient:dynamoClient, ) {
    
}


// Use this helper function to upload an object to S3 bukect
export async function putObject(s3Client: s3Client, bucketName: string, keyName: string, bodyContent: any): Promise <PromiseResult <void, AWSError>> {
    let params = {
        Bucket: bucketName,
        Key: keyName,
        Body: bodyContent
    }
    try {
        await s3Client.putObject(params).promise();
    } catch (error) {
        console.log(`There was an error when trying to put object to S3: ${JSON.stringify(error)}`)
        throw error;
    }
}
