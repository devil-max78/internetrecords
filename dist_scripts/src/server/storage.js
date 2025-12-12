"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.deleteFile = exports.getPublicUrl = exports.generateDownloadUrl = exports.generateUploadUrl = exports.initializeStorage = void 0;
const supabase_1 = require("./supabase");
const crypto_1 = __importDefault(require("crypto"));
const BUCKET_NAME = 'music-files';
// Initialize storage bucket
const initializeStorage = async () => {
    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase_1.supabase.storage.listBuckets();
        if (listError) {
            console.error('Error listing buckets:', listError);
            throw listError;
        }
        const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
        if (!bucketExists) {
            // Create bucket if it doesn't exist
            const { error: createError } = await supabase_1.supabase.storage.createBucket(BUCKET_NAME, {
                public: false,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: ['audio/*', 'image/*', 'application/json']
            });
            if (createError) {
                console.error('Error creating bucket:', createError);
                throw createError;
            }
            console.log(`Storage bucket '${BUCKET_NAME}' created successfully`);
        }
        else {
            console.log(`Storage bucket '${BUCKET_NAME}' already exists`);
        }
    }
    catch (error) {
        console.error('Error initializing storage:', error);
        throw error;
    }
};
exports.initializeStorage = initializeStorage;
// Generate presigned URL for file upload
const generateUploadUrl = async (fileName, fileType, releaseId) => {
    try {
        // Generate unique file path
        const uniqueId = crypto_1.default.randomBytes(16).toString('hex');
        const extension = fileName.split('.').pop();
        const filePath = `${releaseId}/${fileType.toLowerCase()}/${uniqueId}.${extension}`;
        // Create a signed upload URL (valid for 1 hour)
        const { data, error } = await supabase_1.supabase.storage
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
    }
    catch (error) {
        console.error('Error generating upload URL:', error);
        throw error;
    }
};
exports.generateUploadUrl = generateUploadUrl;
// Generate presigned URL for file download
const generateDownloadUrl = async (filePath, expirySeconds = 3600) => {
    try {
        const { data, error } = await supabase_1.supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, expirySeconds);
        if (error) {
            console.error('Error generating download URL:', error);
            throw error;
        }
        return data.signedUrl;
    }
    catch (error) {
        console.error('Error generating download URL:', error);
        throw error;
    }
};
exports.generateDownloadUrl = generateDownloadUrl;
// Get public URL for a file (if bucket is public)
const getPublicUrl = (filePath) => {
    const { data } = supabase_1.supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
    return data.publicUrl;
};
exports.getPublicUrl = getPublicUrl;
// Delete a file
const deleteFile = async (filePath) => {
    try {
        const { error } = await supabase_1.supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);
        if (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
    catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};
exports.deleteFile = deleteFile;
// Upload file directly (for server-side uploads)
const uploadFile = async (filePath, fileBuffer, contentType) => {
    try {
        const { error } = await supabase_1.supabase.storage
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
    }
    catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
exports.uploadFile = uploadFile;
