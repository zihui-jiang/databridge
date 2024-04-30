import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

export interface Request {
    id: string;
    inputText: string;
    s3Path: string;
}

export async function handleUploadRequest(event:any)  {
    // Process the event received:
    console.log(event);
    const idLength = 10;
    const bucketName:string = process.env.BUCKET_NAME!;
    // Generate the ID, lenght is set to 10
    let id = (await import("nanoid")).nanoid(idLength);
    let request:Request = {
            id: id, 
            inputText: event.inputText, 
            s3Path: bucketName + "/" + event.fileName + ".txt"
        };
    console.log(JSON.stringify(request));
    await recordInput(request);
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ message: "Hello, World!" }),
    };
};

export async function recordInput(request: Request) {
    let dynamoClient = new DynamoDBClient();
    let putItemCommand = new PutItemCommand({
        TableName: process.env.TABLE_NAME!,
        Item: {
            'id': {S: request.id},
            'inputText': {S: request.inputText},
            's3Path': {S: request.s3Path}
        }
    });
    const response = await dynamoClient.send(putItemCommand);
    return response;
}
