"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.s3 = exports.bucketName = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const multer = require("multer");
const multerS3 = require("multer-s3");
dotenv_1.default.config();
const region = process.env.AWS_REGION || "us-east-1";
exports.bucketName = process.env.AWS_BUCKET_NAME || "etubees";
const accessKeyId = process.env.AWS_ACCESS_KEY || "Q";
const secretAccessKey = process.env.AWS_SECRET_KEY || "Q";
exports.s3 = new client_s3_1.S3Client({
    region: region,
    credentials: { accessKeyId, secretAccessKey },
});
exports.upload = multer({
    storage: multerS3({
        s3: exports.s3,
        bucket: exports.bucketName,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const directoryPath = "zynoflix-ott/"; // Define the directory path here
            cb(null, directoryPath + Date.now().toString() + "-" + file.originalname);
        },
    }),
});
