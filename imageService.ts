import axios from 'axios';

interface R2Config {
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
}

interface UploadResponse {
  url: string;
  success: boolean;
  message?: string;
}

// Primary R2 bucket configuration
const R2_CONFIG: R2Config = {
  bucket: 'inventorymanagement',
  accessKeyId: '0b94057d1ba9fe92f2c37a5a7463e356',
  secretAccessKey: '7033f1f6db6c4010fb7fe44ce10108be7ee14778c0af265fb191a91c2b9dad53',
  endpoint: 'https://3e9ba1992b6ab16daf095995f9626a57.r2.cloudflarestorage.com'
};

// Public R2 bucket URL for image retrieval
const R2_BUCKET_URL = "https://pub-133f8593b35749f28fa090bc33925b31.r2.dev";

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  // Check if it's already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  // Check if it's a UUID-like filename
  if (imagePath.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)) {
    return `${R2_BUCKET_URL}/${imagePath}`;
  }
  // Return the path as is for other cases
  return imagePath;
};

// Alternative function using the original endpoint
export const getImageUrlFromPrivateBucket = (imagePath: string): string => {
  if (!imagePath) return '';
  return `${R2_CONFIG.endpoint}/${R2_CONFIG.bucket}/${imagePath}`;
};

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<UploadResponse>(
      `${R2_CONFIG.endpoint}/${R2_CONFIG.bucket}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Access-Key-Id': R2_CONFIG.accessKeyId,
          'X-Secret-Access-Key': R2_CONFIG.secretAccessKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      url: '',
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

export const deleteImage = async (imagePath: string): Promise<boolean> => {
  try {
    await axios.delete(
      `${R2_CONFIG.endpoint}/${R2_CONFIG.bucket}/${imagePath}`,
      {
        headers: {
          'X-Access-Key-Id': R2_CONFIG.accessKeyId,
          'X-Secret-Access-Key': R2_CONFIG.secretAccessKey,
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};