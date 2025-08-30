import { RequestHandler } from "express";
import multer from "multer";
import {
  uploadToIPFS,
  uploadJSONToIPFS,
  processFileUpload,
  testIPFSConnection,
} from "../lib/realIPFS";
import { documentQueries, activityQueries } from "../lib/database";

// Configure multer for file uploads
const storage = multer.memoryStorage();

// Common file filter
const allowedFileTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "text/markdown",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const fileFilter = (req: any, file: any, cb: any) => {
  console.log(`[DEBUG] File upload filter check:`, {
    mimetype: file.mimetype,
    originalname: file.originalname,
    fieldname: file.fieldname,
    allowed: allowedFileTypes.includes(file.mimetype),
  });

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error(`[DEBUG] File type not allowed: ${file.mimetype}`);
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// Create multer instances
const singleUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter,
});

const multipleUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 10, // Max 10 files
  },
  fileFilter,
});

export const uploadMiddleware = {
  single: singleUpload.single("file"),
  multiple: multipleUpload.array("files", 10),
};

// Upload single file
export const uploadFile: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const { projectId } = req.body;

    // Process file upload with real IPFS
    const fileProcessingResult = await processFileUpload(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    const ipfsResult = fileProcessingResult.upload;

    // Save to real database if projectId provided
    let document = null;
    if (projectId) {
      try {
        document = await documentQueries.create({
          project_id: parseInt(projectId),
          file_name: req.file.originalname,
          file_type: req.file.mimetype,
          ipfs_hash: ipfsResult.hash,
          file_size: req.file.size,
        });

        // Log activity
        await activityQueries.log({
          action_type: "document_uploaded",
          project_id: parseInt(projectId),
          details: {
            file_name: req.file.originalname,
            file_size: req.file.size,
            ipfs_hash: ipfsResult.hash,
            text_extracted: fileProcessingResult.extractedText.length > 0,
          },
        });
      } catch (dbError) {
        console.error("Database save failed, file uploaded to IPFS:", dbError);
      }
    }

    res.json({
      success: true,
      data: {
        file: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          ipfsHash: ipfsResult.hash,
          ipfsUrl: ipfsResult.url,
        },
        extractedText: fileProcessingResult.extractedText,
        textExtracted: fileProcessingResult.extractedText.length > 0,
        document,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload file",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Upload multiple files
export const uploadFiles: RequestHandler = async (req, res) => {
  try {
    console.log("[DEBUG] Upload files request received:", {
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers),
      contentType: req.headers["content-type"],
      bodyKeys: Object.keys(req.body || {}),
      filesCount: req.files
        ? Array.isArray(req.files)
          ? req.files.length
          : Object.keys(req.files).length
        : 0,
    });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      console.error("[DEBUG] No files found in request");
      return res.status(400).json({
        success: false,
        error: "No files provided",
      });
    }

    console.log(
      "[DEBUG] Files received:",
      files.map((f) => ({
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        fieldname: f.fieldname,
      })),
    );

    const { projectId } = req.body;
    const uploadedFiles = [];
    const documents = [];

    // Upload each file to real IPFS
    for (const file of files) {
      try {
        const fileProcessingResult = await processFileUpload(
          file.buffer,
          file.originalname,
          file.mimetype,
        );

        const ipfsResult = fileProcessingResult.upload;

        const uploadedFile = {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          ipfsHash: ipfsResult.hash,
          ipfsUrl: ipfsResult.url,
          extractedText: fileProcessingResult.extractedText,
          textExtracted: fileProcessingResult.extractedText.length > 0,
        };

        uploadedFiles.push(uploadedFile);

        // Save to real database if projectId provided
        if (projectId) {
          try {
            const document = await documentQueries.create({
              project_id: parseInt(projectId),
              file_name: file.originalname,
              file_type: file.mimetype,
              ipfs_hash: ipfsResult.hash,
              file_size: file.size,
            });
            documents.push(document);
          } catch (dbError) {
            console.error(
              `Database save failed for ${file.originalname}:`,
              dbError,
            );
          }
        }
      } catch (fileError) {
        console.error(`Error uploading file ${file.originalname}:`, fileError);
        // Continue with other files, but log the error
      }
    }

    res.json({
      success: true,
      data: {
        files: uploadedFiles,
        documents,
        totalUploaded: uploadedFiles.length,
        totalRequested: files.length,
      },
      message: `Successfully uploaded ${uploadedFiles.length} of ${files.length} files`,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload files",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create project metadata
export const createProjectMetadata: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      methodology,
      vintageYear,
      estimatedTCO2e,
      documents = [],
    } = req.body;

    // Validate required fields
    if (!name || !location || !methodology || !vintageYear || !estimatedTCO2e) {
      return res.status(400).json({
        success: false,
        error: "Missing required metadata fields",
      });
    }

    // Create metadata object
    const metadata = {
      name,
      description: description || "",
      location,
      methodology,
      vintageYear: parseInt(vintageYear),
      estimatedTCO2e: parseFloat(estimatedTCO2e),
      documents,
      createdAt: new Date().toISOString(),
      version: "1.0",
      standard: "XC3 Carbon Credit Standard",
    };

    // Upload metadata to real IPFS
    const ipfsResult = await uploadJSONToIPFS(metadata);

    res.json({
      success: true,
      data: {
        metadata,
        ipfsHash: ipfsResult.hash,
        ipfsUrl: ipfsResult.url,
        size: ipfsResult.size,
      },
      message: "Project metadata created and uploaded successfully",
    });
  } catch (error) {
    console.error("Error creating project metadata:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create project metadata",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get file info by IPFS hash
export const getFileInfo: RequestHandler = async (req, res) => {
  try {
    const { hash } = req.params;

    // Find document by IPFS hash in real database
    const documents = await documentQueries.getByProjectId(0); // Get all documents
    const document = documents.find((d: any) => d.ipfs_hash === hash);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...document,
        ipfsUrl: `https://ipfs.io/ipfs/${document.ipfs_hash}`,
        downloadUrl: `https://ipfs.io/ipfs/${document.ipfs_hash}?download=true`,
      },
    });
  } catch (error) {
    console.error("Error getting file info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get file info",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Health check for upload service
export const uploadHealth: RequestHandler = async (req, res) => {
  try {
    // Test real IPFS connection
    const ipfsStatus = await testIPFSConnection();

    res.json({
      success: true,
      data: {
        status: "healthy",
        ipfs: ipfsStatus,
        timestamp: new Date().toISOString(),
      },
      message: "Upload service is healthy",
    });
  } catch (error) {
    console.error("Upload health check failed:", error);
    res.status(500).json({
      success: false,
      error: "Upload service unhealthy",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get upload statistics
export const getUploadStats: RequestHandler = async (req, res) => {
  try {
    // Get stats from real database
    const allDocuments = await documentQueries.getByProjectId(0); // Get all documents

    const totalFiles = allDocuments.length;
    const totalSize = allDocuments.reduce(
      (sum: number, doc: any) => sum + (doc.file_size || 0),
      0,
    );
    const fileTypes = allDocuments.reduce(
      (acc: Record<string, number>, doc: any) => {
        acc[doc.file_type] = (acc[doc.file_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const recentUploads = allDocuments
      .sort(
        (a: any, b: any) =>
          new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
      )
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalFiles,
        totalSize,
        averageFileSize: totalFiles > 0 ? totalSize / totalFiles : 0,
        fileTypes,
        recentUploads,
        lastUpload: totalFiles > 0 ? recentUploads[0]?.uploaded_at : null,
      },
    });
  } catch (error) {
    console.error("Error getting upload stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get upload stats",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};
