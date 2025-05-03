# Azure Blob Storage Integration for Zynoflix OTT

This guide explains how to set up and configure Azure Blob Storage for the Zynoflix OTT platform. Our implementation provides a professional, secure, and optimized file storage solution.

## Features

- **Smart Directory Structure**: Files are automatically organized into appropriate directories based on their type
- **Type Validation**: Built-in validation of file types to ensure only correct media formats are accepted
- **Security Considerations**: Properly configured for secure access and validated environment variables
- **Metadata Support**: Automatically adds useful metadata to each uploaded file
- **Proper Error Handling**: Comprehensive error handling with detailed logging
- **Size Limits**: Configurable size limits to prevent abuse

## Prerequisites

- An Azure account (If you don't have one, [create a free account](https://azure.microsoft.com/free/))
- Node.js version 14 or higher
- npm version 6 or higher

## Setting up Azure Blob Storage

1. **Create an Azure Storage Account**:
   - Sign in to the [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" > "Storage" > "Storage Account"
   - Fill in the required fields:
     - Subscription: Select your subscription
     - Resource Group: Create a new one or select an existing one
     - Storage account name: Enter a unique name (will be used in your configuration)
     - Location: Select a location close to your users
     - Performance: Standard
     - Redundancy: Locally-redundant storage (LRS)
   - Click "Review + create", then "Create"

2. **Create a Container**:
   - Once your storage account is created, navigate to it
   - In the left menu, under "Data storage", click "Containers"
   - Click "+ Container"
   - Name: `zynoflix-ott`
   - Public access level: "Blob" (allows anonymous read access for blobs only)
   - Click "Create"

3. **Get Access Keys**:
   - In the left menu of your storage account, under "Security + networking", click "Access keys"
   - Copy "Key1" or "Key2" (either will work)
   - Copy the "Connection string" for the same key

## Environment Variables Configuration

Create a `.env` file in the root of your project with the following content (replace the placeholders with your actual values):

```
# Azure Blob Storage Configuration
AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccountname
AZURE_STORAGE_ACCESS_KEY=yourstorageaccountkey
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=yourstorageaccountname;AccountKey=yourstorageaccountkey;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=zynoflix-ott
```

## Understanding the Implementation

Our implementation includes several features that make file storage more professional:

### Directory Structure

Files are automatically sorted into appropriate directories:

- `profiles/` - Profile pictures and avatars
- `videos/` - Video content files
- `thumbnails/` - Thumbnails and preview images
- `banners/` - Banner images and backgrounds 
- `ads/` - Advertisement content
- `uploads/` - Default directory for other types

### File Naming

Files are named using a combination of:
- Timestamp (for chronological sorting)
- UUID (for uniqueness)
- Original file extension (for compatibility)

For example: `profiles/1621459871235-6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b.jpg`

### MIME Type Validation

The system validates file types based on their purpose:
- Video uploads: mp4, webm, ogg, quicktime
- Image uploads: jpeg, png, gif, webp

### File Size Limits

- Maximum file size: 100MB
- Maximum files per request: 5
- Maximum form fields: 10

## CORS Configuration (For Browser Access)

If your web application needs to upload directly to Azure Blob Storage:

1. In the Azure Portal, navigate to your storage account
2. In the left menu, under "Settings", click "Resource sharing (CORS)"
3. Add a new CORS rule with the following settings:
   - Allowed origins: `*` (For development only; restrict this in production)
   - Allowed methods: SELECT ALL
   - Allowed headers: `*`
   - Exposed headers: `*`
   - Max age: `86400`
4. Click "Save"

## Usage Examples

### Uploading a Profile Picture

```javascript
app.post('/upload-profile', upload.single('profilePic'), (req, res) => {
  // The file will be automatically stored in the 'profiles/' directory
  // and the file URL will be available at req.file.url
  res.json({ success: true, profileUrl: req.file.url });
});
```

### Uploading Multiple Files

```javascript
const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

app.post('/upload-content', uploadFields, (req, res) => {
  // Files will be automatically stored in their respective directories
  const thumbnailUrl = req.files.thumbnail[0].url;
  const videoUrl = req.files.video[0].url;
  
  res.json({ 
    success: true, 
    thumbnailUrl, 
    videoUrl 
  });
});
```

## Security Best Practices

1. **Never expose your access keys** in client-side code
2. **Restrict CORS origins** in production to only your trusted domains
3. **Use SAS tokens** for time-limited direct access to specific blobs
4. **Implement server-side validation** in addition to client-side validation
5. **Monitor storage metrics** to detect unusual access patterns

## Testing Your Configuration

You can test your configuration by running the application and uploading a file. The file should be stored in the appropriate directory in your Azure Storage container, with proper metadata and naming. 