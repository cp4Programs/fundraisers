import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAssetsBucketName } from "./env";

const client = new S3Client({});

function getBucket(): string {
  return getAssetsBucketName();
}

const PRESIGN_UPLOAD_EXPIRES = 60 * 15; // 15 min
const PRESIGN_READ_EXPIRES = 60 * 60; // 1 hour

/**
 * Generate a presigned URL for uploading a dancer photo (PUT).
 * Key format: fundraisers/{fundraiserId}/dancer.{ext}
 */
export async function getUploadPresignedUrl(key: string, contentType: string): Promise<string | null> {
  if (!getBucket()) return null;
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: PRESIGN_UPLOAD_EXPIRES });
}

/**
 * Generate a presigned URL for reading an object (GET).
 */
export async function getReadPresignedUrl(key: string): Promise<string | null> {
  if (!getBucket()) return null;
  const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
  return getSignedUrl(client, command, { expiresIn: PRESIGN_READ_EXPIRES });
}

/**
 * Suggested S3 key for a fundraiser's dancer photo.
 */
export function dancerPhotoKey(fundraiserId: string, ext: string = "jpg"): string {
  return `fundraisers/${fundraiserId}/dancer.${ext}`;
}
