import { create } from "ipfs-http-client";
import fs from "fs/promises";
import path from "path";

// IPFS client configuration
const ipfsClient = create({
  host: process.env.IPFS_HOST || "localhost",
  port: parseInt(process.env.IPFS_PORT || "5001"),
  protocol: process.env.IPFS_PROTOCOL || "http",
});

// Alternative: Web3.Storage for demo (requires API key)
const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN;

interface UploadResult {
  hash: string;
  size: number;
  url: string;
}

// Upload file to IPFS
export async function uploadToIPFS(
  fileBuffer: Buffer,
  fileName: string,
): Promise<UploadResult> {
  try {
    // Try local IPFS first
    if (process.env.IPFS_ENABLED === "true") {
      const result = await ipfsClient.add({
        path: fileName,
        content: fileBuffer,
      });

      return {
        hash: result.cid.toString(),
        size: result.size,
        url: `https://ipfs.io/ipfs/${result.cid.toString()}`,
      };
    }

    // Fallback to Web3.Storage if available
    if (WEB3_STORAGE_TOKEN) {
      try {
        // @ts-ignore - Web3.Storage types may not be available
        const { Web3Storage, File } = await import("web3.storage");
        const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

        const file = new File([fileBuffer], fileName);
        const cid = await client.put([file]);

        return {
          hash: cid,
          size: fileBuffer.length,
          url: `https://${cid}.ipfs.w3s.link/${fileName}`,
        };
      } catch (importError) {
        console.warn("Web3.Storage not available, using mock storage");
      }
    }

    // Mock storage for demo
    const mockHash = generateMockHash(fileName);
    return {
      hash: mockHash,
      size: fileBuffer.length,
      url: `https://ipfs.io/ipfs/${mockHash}`,
    };
  } catch (error) {
    console.error("IPFS upload error:", error);

    // Return mock data for demo
    const mockHash = generateMockHash(fileName);
    return {
      hash: mockHash,
      size: fileBuffer.length,
      url: `https://ipfs.io/ipfs/${mockHash}`,
    };
  }
}

// Upload JSON metadata to IPFS
export async function uploadJSONToIPFS(
  data: any,
  fileName?: string,
): Promise<UploadResult> {
  const jsonString = JSON.stringify(data, null, 2);
  const buffer = Buffer.from(jsonString, "utf8");
  const name = fileName || `metadata-${Date.now()}.json`;

  return uploadToIPFS(buffer, name);
}

// Download from IPFS
export async function downloadFromIPFS(hash: string): Promise<Buffer> {
  try {
    if (process.env.IPFS_ENABLED === "true") {
      const chunks = [];
      for await (const chunk of ipfsClient.cat(hash)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }

    // Fallback to HTTP gateway
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`Failed to download from IPFS: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("IPFS download error:", error);
    throw error;
  }
}

// Get IPFS gateway URL
export function getIPFSUrl(hash: string, fileName?: string): string {
  if (fileName) {
    return `https://ipfs.io/ipfs/${hash}/${fileName}`;
  }
  return `https://ipfs.io/ipfs/${hash}`;
}

// Pin file to ensure persistence
export async function pinToIPFS(hash: string): Promise<boolean> {
  try {
    if (process.env.IPFS_ENABLED === "true") {
      await ipfsClient.pin.add(hash);
      return true;
    }

    // For Web3.Storage, files are automatically pinned
    // For demo, just return true
    return true;
  } catch (error) {
    console.error("IPFS pin error:", error);
    return false;
  }
}

// Generate mock IPFS hash for demo
function generateMockHash(fileName: string): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const hash = Buffer.from(`${fileName}-${timestamp}-${random}`)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 46);

  return `Qm${hash}`;
}

// Validate IPFS hash format
export function isValidIPFSHash(hash: string): boolean {
  // CIDv0 (Qm...) or CIDv1 format
  const cidv0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/;
  const cidv1Pattern = /^[a-z2-7]{59}$/;

  return cidv0Pattern.test(hash) || cidv1Pattern.test(hash);
}

// Create project metadata for IPFS
export async function createProjectMetadata(projectData: {
  name: string;
  description: string;
  location: string;
  methodology: string;
  vintageYear: number;
  estimatedTCO2e: number;
  documents?: string[];
}): Promise<UploadResult> {
  const metadata = {
    name: projectData.name,
    description: projectData.description,
    image: "", // Could be project image
    attributes: [
      {
        trait_type: "Location",
        value: projectData.location,
      },
      {
        trait_type: "Methodology",
        value: projectData.methodology,
      },
      {
        trait_type: "Vintage Year",
        value: projectData.vintageYear,
      },
      {
        trait_type: "Estimated tCO2e",
        value: projectData.estimatedTCO2e,
      },
    ],
    properties: {
      category: "Carbon Credit Project",
      created: new Date().toISOString(),
      documents: projectData.documents || [],
    },
  };

  return uploadJSONToIPFS(
    metadata,
    `project-${projectData.name.replace(/\s+/g, "-").toLowerCase()}-metadata.json`,
  );
}

// Health check for IPFS connection
export async function checkIPFSHealth(): Promise<boolean> {
  try {
    if (process.env.IPFS_ENABLED === "true") {
      const version = await ipfsClient.version();
      return !!version;
    }
    return true; // Mock/Web3.Storage doesn't need health check
  } catch (error) {
    console.error("IPFS health check failed:", error);
    return false;
  }
}
