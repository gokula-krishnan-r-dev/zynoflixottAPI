import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
const multer = require("multer");
const multerS3 = require("multer-s3");
dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
export const bucketName = process.env.AWS_BUCKET_NAME || "etubees";
const accessKeyId = process.env.AWS_ACCESS_KEY || "Q";
const secretAccessKey = process.env.AWS_SECRET_KEY || "Q";

export const s3 = new S3Client({
  region: region,
  credentials: { accessKeyId, secretAccessKey },
});

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    metadata: function (req: any, file: any, cb: any) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: any, file: any, cb: any) {
      const directoryPath = "zynoflix-ott/"; // Define the directory path here
      cb(null, directoryPath + Date.now().toString() + "-" + file.originalname);
    },
  }),
});
