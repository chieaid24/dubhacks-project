import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only .pptx and .pdf files are allowed.' }, { status: 400 });
    }

    // Convert file to buffer for server-side upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file directly to S3 from server
    const { key, fileUrl } = await uploadFileToS3(
      buffer,
      file.name,
      file.type,
      process.env.S3_BUCKET_NAME,
      'slides' // Upload to slides folder
    );

    return NextResponse.json({
      key,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload request' },
      { status: 500 }
    );
  }
}
