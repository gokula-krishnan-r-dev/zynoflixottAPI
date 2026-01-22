"use strict";
// import { MulterAzureStorage } from "multer-azure-blob-storage";
// import dotenv from "dotenv";
// const multer = require("multer");
// dotenv.config();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.azureStorage = void 0;
// // Azure Storage configuration
// const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "youraccountname";
// const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY || "youraccesskey";
// const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "zynoflix-ott";
// // Configure Azure Blob Storage connection
// export const azureStorage = new MulterAzureStorage({
//   connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
//   accessKey: accountKey,
//   accountName: accountName,
//   containerName: containerName,
//   containerAccessLevel: 'blob',
//   urlExpirationTime: 60,
//   blobName: (req: any, file: any): Promise<string> => {
//     return new Promise<string>((resolve, reject) => {
//       const directoryPath = "zynoflix/";
//       const blobName = directoryPath + Date.now().toString() + "-" + file.originalname;
//       resolve(blobName);
//     });
//   }
// });
// // Create multer middleware with Azure Storage
// export const upload = multer({
//   storage: azureStorage
// });
const multer_azure_blob_storage_1 = require("multer-azure-blob-storage");
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Load environment variables
dotenv_1.default.config();
// Azure Storage configuration
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'zynoflix-ott';
// Validate necessary configuration
if (!connectionString && (!accountName || !accountKey)) {
    console.warn('Azure Blob Storage is not properly configured. Please check your environment variables.');
    console.warn('Required: AZURE_STORAGE_CONNECTION_STRING or both AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCESS_KEY');
}
// Define the directory structure for uploads
const UPLOAD_DIRECTORIES = {
    PROFILES: 'profiles/',
    VIDEOS: 'videos/',
    THUMBNAILS: 'thumbnails/',
    BANNERS: 'banners/',
    ADS: 'ads/'
};
/**
 * Resolves the blob name (path) based on the file type and request
 */
const resolveBlobName = (req, file) => {
    return new Promise((resolve, reject) => {
        try {
            // Extract the field name from the file
            const fieldName = file.fieldname.toLowerCase();
            let directoryPath = 'uploads/'; // Default directory
            // Determine directory based on field name
            if (fieldName.includes('profile') || fieldName.includes('avatar')) {
                directoryPath = UPLOAD_DIRECTORIES.PROFILES;
            }
            else if (fieldName.includes('video') || fieldName.includes('orginal')) {
                directoryPath = UPLOAD_DIRECTORIES.VIDEOS;
            }
            else if (fieldName.includes('thumbnail')) {
                directoryPath = UPLOAD_DIRECTORIES.THUMBNAILS;
            }
            else if (fieldName.includes('banner') || fieldName.includes('background')) {
                directoryPath = UPLOAD_DIRECTORIES.BANNERS;
            }
            else if (fieldName.includes('ads')) {
                directoryPath = UPLOAD_DIRECTORIES.ADS;
            }
            // Create a unique file name with the original extension
            const fileExtension = path_1.default.extname(file.originalname);
            const fileName = `${Date.now()}-${(0, uuid_1.v4)()}${fileExtension}`;
            // Combine directory path and file name
            const blobName = directoryPath + fileName;
            resolve(blobName);
        }
        catch (error) {
            reject(error);
        }
    });
};
/**
 * Resolves metadata for the file
 */
const resolveMetadata = (req, file) => {
    return new Promise((resolve) => {
        // Basic metadata for the file
        const metadata = {
            fieldName: file.fieldname,
            contentType: file.mimetype,
            uploadedBy: req.userId || 'anonymous',
            originalName: file.originalname,
            uploadedAt: new Date().toISOString()
        };
        resolve(metadata);
    });
};
/**
 * Resolves content settings for the file
 */
const resolveContentSettings = (req, file) => {
    return new Promise((resolve) => {
        // Content settings, mainly for content type
        const contentSettings = {
            contentType: file.mimetype
        };
        resolve(contentSettings);
    });
};
// Configure Azure Blob Storage connection
exports.azureStorage = new multer_azure_blob_storage_1.MulterAzureStorage({
    connectionString: connectionString,
    accessKey: accountKey,
    accountName: accountName,
    containerName: containerName,
    containerAccessLevel: 'blob',
    urlExpirationTime: 60, // 60 minutes
    blobName: resolveBlobName,
    metadata: resolveMetadata,
    contentSettings: resolveContentSettings
});
// Configure multer for maximum file sizes
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB - increased to support larger videos
const MAX_FIELDS = 100; // Increased from 10 to 100 to allow more form fields
// Create multer middleware with Azure Storage
exports.upload = (0, multer_1.default)({
    storage: exports.azureStorage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5, // Maximum number of files per request
        fields: MAX_FIELDS
    },
    fileFilter: (req, file, cb) => {
        // Define allowed MIME types based on field name
        const fieldName = file.fieldname.toLowerCase();
        // Allow videos for video uploads
        if (fieldName.includes('video') || fieldName.includes('orginal') || fieldName.includes('preview')) {
            const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(null, false);
                // We can't pass an error directly, so we'll log it instead
                console.error(`Invalid file type for ${fieldName}. Expected video file but got ${file.mimetype}`);
            }
        }
        // Allow images for profile, thumbnail, banner
        else if (fieldName.includes('profile') || fieldName.includes('thumbnail') ||
            fieldName.includes('banner') || fieldName.includes('background') ||
            fieldName.includes('logo')) {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(null, false);
                // We can't pass an error directly, so we'll log it instead
                console.error(`Invalid file type for ${fieldName}. Expected image file but got ${file.mimetype}`);
            }
        }
        // Allow any file type for other fields
        else {
            cb(null, true);
        }
    }
});
//# sourceMappingURL=s3.js.map