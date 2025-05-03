"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.azureStorage = void 0;
const multer_azure_blob_storage_1 = require("multer-azure-blob-storage");
const dotenv_1 = __importDefault(require("dotenv"));
const multer = require("multer");
dotenv_1.default.config();
// Azure Storage configuration
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "youraccountname";
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY || "youraccesskey";
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "zynoflix-ott";
// Configure Azure Blob Storage connection
exports.azureStorage = new multer_azure_blob_storage_1.MulterAzureStorage({
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    accessKey: accountKey,
    accountName: accountName,
    containerName: containerName,
    containerAccessLevel: 'blob',
    urlExpirationTime: 60,
    blobName: (req, file) => {
        return new Promise((resolve, reject) => {
            const directoryPath = "zynoflix/";
            const blobName = directoryPath + Date.now().toString() + "-" + file.originalname;
            resolve(blobName);
        });
    }
});
// Create multer middleware with Azure Storage
exports.upload = multer({
    storage: exports.azureStorage
});
//# sourceMappingURL=s3.js.map