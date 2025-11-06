import { supabase } from './supabase';
import crypto from 'crypto';

const BUCKET_NAME = 'music-files';

// Initialize storage bucket
export const initializeStorage = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['audio/*', 'image/*', 'application/json']
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw createError;
      }
      
      console.log(`Storage bucket '${BUCKET_NAME}' created successfully`);
    } else {
      console.log(`Storage bucket '${BUCKET_NAME}' already exists`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
};

// Generate presigned URL for file upload
export const generateUploadUrl = async (
  fileName: string,
  fileType: string,
  releaseId: string
): Promise<{ uploadUrl: string; filePath: string }> => {
  try {
    // Generate unique file path
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const extension = fileName.split('.').pop();
    const filePath = `${releaseId}/${fileType.toLowerCase()}/${uniqueId}.${extension}`;
    
    // Create a signed upload URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(filePath);
    
    if (error) {
      console.error('Error generating upload URL:', error);
      throw error;
    }
    
    return {
      uploadUrl: data.signedUrl,
      filePath: filePath
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw error;
  }
};

// Generate presigned URL for file download
export const generateDownloadUrl = async (
  filePath: string,
  expirySeconds = 3600
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expirySeconds);
    
    if (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw error;
  }
};

// Get public URL for a file (if bucket is public)
export const getPublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Delete a file
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Upload file directly (for server-side uploads)
export const uploadFile = async (
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    return filePath;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
