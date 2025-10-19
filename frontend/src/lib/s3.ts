import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Generate presigned URL for file upload
export async function generateUploadUrl(
  fileName: string,
  fileType: string,
  bucketName: string = process.env.S3_BUCKET_NAME!,
  folder: string = 'slides'
) {
  const key = `${folder}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return {
    uploadUrl,
    key,
    fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`,
  };
}

// Upload file directly to S3 (alternative method)
export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  fileType: string,
  bucketName: string = process.env.S3_BUCKET_NAME!,
  folder: string = 'slides'
) {
  const key = `${folder}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: fileType,
  }); 

  await s3Client.send(command);
  
  return {
    key,
    fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`,
  };
}
