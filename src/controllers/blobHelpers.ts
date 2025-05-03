/**
 * Helper functions to normalize file object between AWS S3 and Azure Blob Storage
 */

/**
 * Gets file URL from either S3 or Azure Blob Storage file objects
 * 
 * AWS S3 returns file.location
 * Azure Blob Storage returns file.url
 * 
 * @param file The file object from multer
 * @returns The URL of the uploaded file
 */
export const getFileUrl = (file: any): string => {
  // Azure Blob Storage returns file.url
  if (file.url) {
    return file.url;
  }
  
  // AWS S3 returns file.location
  if (file.location) {
    return file.location;
  }
  
  throw new Error('Could not get file URL from file object');
}; 