import { handleUploadRequest } from "./src/request-process";
import { handleGetRequest } from "./src/presigned-process";

export async function handleGetPreSignedURL(event: any) {
    await handleGetRequest(event);
}

export async function handleUpload(event: any) {
    await handleUploadRequest(event);
}