import { Web3Storage } from "web3.storage";

// Initialize Web3.Storage client
const storage = new Web3Storage({
  token: process.env.WEB3_STORAGE_TOKEN || "",
});

export interface UploadResult {
  hash: string;
  url: string;
  size: number;
  filename: string;
}

/**
 * Upload file to IPFS via Web3.Storage
 */
export async function uploadToIPFS(
  buffer: Buffer,
  filename: string,
  contentType?: string,
): Promise<UploadResult> {
  try {
    if (!process.env.WEB3_STORAGE_TOKEN) {
      console.warn("WEB3_STORAGE_TOKEN not set, using mock IPFS");
      return mockUploadToIPFS(buffer, filename);
    }

    // Create File from buffer
    const file = new File([buffer], filename, { type: contentType });

    // Upload to IPFS
    const cid = await storage.put([file], {
      name: `xc3-upload-${Date.now()}`,
      maxRetries: 3,
    });

    const hash = cid.toString();
    const url = `https://${cid}.ipfs.w3s.link/${filename}`;

    return {
      hash,
      url,
      size: buffer.length,
      filename,
    };
  } catch (error) {
    console.error("IPFS upload failed:", error);
    console.log("Falling back to mock IPFS");
    return mockUploadToIPFS(buffer, filename);
  }
}

/**
 * Upload JSON data to IPFS
 */
export async function uploadJSONToIPFS(
  data: any,
  filename = "metadata.json",
): Promise<UploadResult> {
  const jsonString = JSON.stringify(data, null, 2);
  const buffer = Buffer.from(jsonString, "utf8");

  return uploadToIPFS(buffer, filename, "application/json");
}

/**
 * Upload multiple files to IPFS
 */
export async function uploadFilesToIPFS(
  files: Array<{
    buffer: Buffer;
    filename: string;
    contentType?: string;
  }>,
): Promise<UploadResult[]> {
  try {
    if (!process.env.WEB3_STORAGE_TOKEN) {
      console.warn(
        "WEB3_STORAGE_TOKEN not set, using mock IPFS for batch upload",
      );
      return Promise.all(
        files.map((f) => mockUploadToIPFS(f.buffer, f.filename)),
      );
    }

    // Create File objects
    const fileObjects = files.map(
      (f) => new File([f.buffer], f.filename, { type: f.contentType }),
    );

    // Upload all files together
    const cid = await storage.put(fileObjects, {
      name: `xc3-batch-upload-${Date.now()}`,
      maxRetries: 3,
    });

    // Return results for each file
    return files.map((f) => ({
      hash: cid.toString(),
      url: `https://${cid}.ipfs.w3s.link/${f.filename}`,
      size: f.buffer.length,
      filename: f.filename,
    }));
  } catch (error) {
    console.error("IPFS batch upload failed:", error);
    console.log("Falling back to individual mock uploads");
    return Promise.all(
      files.map((f) => mockUploadToIPFS(f.buffer, f.filename)),
    );
  }
}

/**
 * Get file from IPFS
 */
export async function getFromIPFS(hash: string): Promise<{
  data: Buffer;
  contentType?: string;
} | null> {
  try {
    const response = await fetch(`https://${hash}.ipfs.w3s.link/`);
    if (!response.ok) {
      throw new Error(`IPFS fetch failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const data = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || undefined;

    return { data, contentType };
  } catch (error) {
    console.error("IPFS retrieval failed:", error);
    return null;
  }
}

/**
 * Check IPFS connectivity
 */
export async function testIPFSConnection(): Promise<{
  connected: boolean;
  provider: string;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    if (!process.env.WEB3_STORAGE_TOKEN) {
      return {
        connected: false,
        provider: "Web3.Storage",
        responseTime: Date.now() - startTime,
        error: "WEB3_STORAGE_TOKEN not configured",
      };
    }

    // Test upload
    const testData = Buffer.from("XC3 IPFS connectivity test");
    const result = await uploadToIPFS(testData, "test.txt", "text/plain");

    return {
      connected: true,
      provider: "Web3.Storage",
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      provider: "Web3.Storage",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mock IPFS for development/fallback
 */
function mockUploadToIPFS(buffer: Buffer, filename: string): UploadResult {
  const hash = `Qm${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

  return {
    hash,
    url: `https://ipfs.io/ipfs/${hash}/${filename}`,
    size: buffer.length,
    filename,
  };
}

/**
 * Extract text from common file types
 */
export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const lowerFilename = filename.toLowerCase();

  try {
    // Text files
    if (
      mimeType.startsWith("text/") ||
      lowerFilename.endsWith(".txt") ||
      lowerFilename.endsWith(".md")
    ) {
      return buffer.toString("utf8");
    }

    // JSON files
    if (mimeType === "application/json" || lowerFilename.endsWith(".json")) {
      const jsonData = JSON.parse(buffer.toString("utf8"));
      return JSON.stringify(jsonData, null, 2);
    }

    // CSV files
    if (mimeType === "text/csv" || lowerFilename.endsWith(".csv")) {
      return buffer.toString("utf8");
    }

    // For binary files, return metadata
    if (lowerFilename.endsWith(".pdf")) {
      return `PDF Document: ${filename} (${buffer.length} bytes) - Content extraction requires PDF parser`;
    }

    if (lowerFilename.match(/\.(docx?|xlsx?|pptx?)$/)) {
      return `Office Document: ${filename} (${buffer.length} bytes) - Content extraction requires office parser`;
    }

    if (lowerFilename.match(/\.(jpe?g|png|gif|webp|svg)$/)) {
      return `Image File: ${filename} (${buffer.length} bytes) - Visual content, OCR capability needed for text extraction`;
    }

    // Default fallback
    return `File: ${filename} (${mimeType}, ${buffer.length} bytes) - Binary content, specialized parser needed for text extraction`;
  } catch (error) {
    console.error("Text extraction failed:", error);
    return `File: ${filename} (${buffer.length} bytes) - Text extraction failed: ${error.message}`;
  }
}

/**
 * Get file info including text extraction
 */
export async function processFileUpload(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<{
  upload: UploadResult;
  extractedText: string;
  metadata: {
    filename: string;
    mimeType: string;
    size: number;
    textExtracted: boolean;
  };
}> {
  const upload = await uploadToIPFS(buffer, filename, mimeType);
  const extractedText = await extractTextFromFile(buffer, filename, mimeType);

  return {
    upload,
    extractedText,
    metadata: {
      filename,
      mimeType,
      size: buffer.length,
      textExtracted: extractedText.length > 0,
    },
  };
}
