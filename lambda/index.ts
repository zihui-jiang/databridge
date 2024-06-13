import { handleUploadRequest } from "./src/request-process";
import { handleGetRequest } from "./src/presigned-process";
import { handleTrigger } from "./src/trigger-process";

export async function handleGetPreSignedURL(event: any) {
    return await handleGetRequest(event);
}

export async function handleUpload(event: any) {
    return await handleUploadRequest(event);
}

export async function triggerByEvent(event: any) {
    return handleTrigger(event);
}