import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const s3 = new S3Client({ 
  region: process.env.AWS_REGION || 'af-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function uploadIdDocument(
  fileBuffer: Buffer,
  mimeType: string,
  repId: string
): Promise<string> {
  const key = `id-documents/${repId}/${crypto.randomUUID()}`;
  await s3.send(new PutObjectCommand({
    Bucket:      process.env.S3_BUCKET_NAME!,
    Key:         key,
    Body:        fileBuffer,
    ContentType: mimeType,
    // Documents are NEVER public
    ACL:         'private',
  }));
  return key; // Store key, not full URL
}

export async function getSignedDocumentUrl(key: string): Promise<string> {
  // Admin-only — signed URL expires in 1 hour
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteDocument(key: string): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  }));
}
