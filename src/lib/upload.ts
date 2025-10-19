export interface UploadResponse {
  uploadUrl: string;
  key: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export async function uploadFileToS3(file: File): Promise<UploadResponse> {
  // Upload file through our API (server-side upload to avoid CORS issues)
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  const { key, fileUrl, fileName, fileSize, fileType } = await response.json();

  return {
    uploadUrl: '', // Not needed for server-side upload
    key,
    fileUrl,
    fileName,
    fileSize,
    fileType,
  };
}
