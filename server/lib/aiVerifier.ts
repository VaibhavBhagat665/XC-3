// Local AI Verification Service
// This simulates AI analysis without requiring external APIs

interface VerificationResult {
  score: number;
  confidence: number;
  explanation: string;
  issues: string[];
  strengths: string[];
  model: string;
  processingTime: number;
  artifactsHash?: string;
}

interface DocumentAnalysis {
  fileName: string;
  fileType: string;
  analysis: {
    readability: number;
    completeness: number;
    authenticity: number;
    consistency: number;
  };
  extractedData: {
    location?: string;
    methodology?: string;
    carbonVolume?: number;
    timeframe?: string;
  };
}

// Mock AI models for demonstration
class LocalAIVerifier {
  private model: string = "Local Carbon Verifier v1.0";

  async analyzeDocument(
    fileBuffer: Buffer,
    fileName: string,
    fileType: string,
  ): Promise<DocumentAnalysis> {
    // Simulate processing time
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    // Simulate document analysis based on file characteristics
    const fileSize = fileBuffer.length;
    const hasValidExtension = this.isValidDocumentType(fileType);

    // Mock OCR and content analysis
    const mockContent = this.simulateOCR(fileName, fileType, fileSize);

    // Analyze extracted content
    const analysis = this.analyzeContent(mockContent);

    return {
      fileName,
      fileType,
      analysis,
      extractedData: mockContent.extractedData,
    };
  }

  async verifyProject(
    projectData: any,
    documents: DocumentAnalysis[],
  ): Promise<VerificationResult> {
    const startTime = Date.now();

    // Calculate document quality scores
    const avgReadability =
      documents.reduce((sum, doc) => sum + doc.analysis.readability, 0) /
      documents.length;
    const avgCompleteness =
      documents.reduce((sum, doc) => sum + doc.analysis.completeness, 0) /
      documents.length;
    const avgAuthenticity =
      documents.reduce((sum, doc) => sum + doc.analysis.authenticity, 0) /
      documents.length;
    const avgConsistency =
      documents.reduce((sum, doc) => sum + doc.analysis.consistency, 0) /
      documents.length;

    // Project metadata analysis
    const metadataScore = this.analyzeMetadata(projectData);

    // Cross-reference analysis
    const consistencyScore = this.crossReferenceDocuments(
      documents,
      projectData,
    );

    // Calculate overall score
    const documentScore =
      (avgReadability + avgCompleteness + avgAuthenticity + avgConsistency) / 4;
    const finalScore =
      documentScore * 0.6 + metadataScore * 0.2 + consistencyScore * 0.2;

    // Generate explanation and feedback
    const { explanation, issues, strengths } = this.generateFeedback(
      finalScore,
      { avgReadability, avgCompleteness, avgAuthenticity, avgConsistency },
      metadataScore,
      consistencyScore,
      documents.length,
    );

    const processingTime = Date.now() - startTime;

    return {
      score: finalScore,
      confidence: Math.min(0.95, 0.7 + documents.length * 0.05), // Higher confidence with more docs
      explanation,
      issues,
      strengths,
      model: this.model,
      processingTime,
      artifactsHash: this.generateArtifactsHash(projectData, documents),
    };
  }

  private isValidDocumentType(fileType: string): boolean {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "text/plain",
      "text/csv",
    ];
    return validTypes.includes(fileType);
  }

  private simulateOCR(fileName: string, fileType: string, fileSize: number) {
    // Simulate OCR results based on file characteristics
    const isImage = fileType.startsWith("image/");
    const isPDF = fileType === "application/pdf";
    const isDoc = fileType.includes("word") || fileType.includes("document");

    // Mock extracted text quality based on file type
    let textQuality = 0.8;
    if (isImage) textQuality = 0.6 + Math.random() * 0.3;
    if (isPDF) textQuality = 0.8 + Math.random() * 0.2;
    if (isDoc) textQuality = 0.9 + Math.random() * 0.1;

    // Simulate extracted data
    const mockData = {
      textQuality,
      wordCount: Math.floor(fileSize / 10) + Math.floor(Math.random() * 1000),
      extractedData: {
        location: this.extractMockLocation(fileName),
        methodology: this.extractMockMethodology(fileName),
        carbonVolume: Math.floor(Math.random() * 50000) + 1000,
        timeframe: "2023-2024",
      },
    };

    return mockData;
  }

  private analyzeContent(content: any): DocumentAnalysis["analysis"] {
    const baseScore = 0.7;
    const variation = 0.25;

    return {
      readability: Math.min(1, baseScore + Math.random() * variation),
      completeness: Math.min(1, baseScore + Math.random() * variation),
      authenticity: Math.min(1, baseScore + Math.random() * variation),
      consistency: Math.min(1, baseScore + Math.random() * variation),
    };
  }

  private analyzeMetadata(projectData: any): number {
    let score = 0.7; // Base score

    // Check required fields
    if (projectData.name && projectData.name.length > 5) score += 0.05;
    if (projectData.location && projectData.location.length > 3) score += 0.05;
    if (projectData.methodology) score += 0.05;
    if (projectData.description && projectData.description.length > 50)
      score += 0.05;
    if (projectData.estimated_tco2e && projectData.estimated_tco2e > 0)
      score += 0.05;
    if (projectData.vintage_year && projectData.vintage_year >= 2020)
      score += 0.05;

    return Math.min(1, score);
  }

  private crossReferenceDocuments(
    documents: DocumentAnalysis[],
    projectData: any,
  ): number {
    let consistencyScore = 0.8; // Base consistency

    // Check if extracted data matches project metadata
    documents.forEach((doc) => {
      if (doc.extractedData.methodology && projectData.methodology) {
        if (
          doc.extractedData.methodology
            .toLowerCase()
            .includes(projectData.methodology.toLowerCase())
        ) {
          consistencyScore += 0.02;
        }
      }

      if (doc.extractedData.location && projectData.location) {
        if (
          doc.extractedData.location
            .toLowerCase()
            .includes(projectData.location.toLowerCase())
        ) {
          consistencyScore += 0.02;
        }
      }
    });

    return Math.min(1, consistencyScore);
  }

  private generateFeedback(
    score: number,
    docScores: any,
    metadataScore: number,
    consistencyScore: number,
    docCount: number,
  ) {
    const issues: string[] = [];
    const strengths: string[] = [];
    let explanation = "";

    // Analyze score and generate feedback
    if (score >= 0.85) {
      explanation =
        "Excellent project documentation. All verification criteria exceeded expectations.";
      strengths.push("Comprehensive documentation");
      strengths.push("High data consistency");
      strengths.push("Clear methodology alignment");
    } else if (score >= 0.75) {
      explanation =
        "Good project documentation with minor areas for improvement.";
      strengths.push("Solid documentation foundation");
      if (docScores.avgAuthenticity > 0.8)
        strengths.push("High document authenticity");
    } else if (score >= 0.65) {
      explanation =
        "Acceptable documentation but improvements needed for optimal verification.";
      if (docScores.avgReadability < 0.7)
        issues.push("Document readability could be improved");
      if (docScores.avgCompleteness < 0.7)
        issues.push("Some documentation appears incomplete");
    } else {
      explanation =
        "Documentation requires significant improvements before verification can proceed.";
      issues.push("Insufficient documentation quality");
      if (metadataScore < 0.7)
        issues.push("Project metadata needs more detail");
      if (consistencyScore < 0.7)
        issues.push("Inconsistencies found between documents");
    }

    // Document count feedback
    if (docCount < 3) {
      issues.push("Consider providing additional supporting documents");
    } else if (docCount > 5) {
      strengths.push("Comprehensive document portfolio");
    }

    return { explanation, issues, strengths };
  }

  private extractMockLocation(fileName: string): string {
    const locations = [
      "Brazil, Amazon Basin",
      "California, USA",
      "British Columbia, Canada",
      "Queensland, Australia",
      "Rajasthan, India",
      "Acre, Brazil",
      "Costa Rica",
      "Philippines",
      "Indonesia",
      "Kenya",
    ];

    // Simple hash-based selection for consistency
    const hash = fileName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return locations[Math.abs(hash) % locations.length];
  }

  private extractMockMethodology(fileName: string): string {
    const methodologies = [
      "REDD+",
      "CDM",
      "VCS",
      "Gold Standard",
      "CAR",
      "ACR",
    ];

    // Simple hash-based selection for consistency
    const hash = fileName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return methodologies[Math.abs(hash) % methodologies.length];
  }

  private generateArtifactsHash(
    projectData: any,
    documents: DocumentAnalysis[],
  ): string {
    const content = JSON.stringify({ projectData, documents });
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `Qm${Math.abs(hash).toString(36).padStart(44, "0").substring(0, 44)}`;
  }
}

// Fraud detection heuristics
class FraudDetector {
  static detectPotentialFraud(
    documents: DocumentAnalysis[],
    projectData: any,
  ): {
    riskLevel: "low" | "medium" | "high";
    flags: string[];
    score: number;
  } {
    const flags: string[] = [];
    let riskScore = 0;

    // Check for suspicious patterns
    if (documents.length < 2) {
      flags.push("Insufficient documentation");
      riskScore += 0.2;
    }

    // Check for extremely high carbon volumes without proper justification
    if (projectData.estimated_tco2e > 100000) {
      flags.push("Unusually high carbon volume claimed");
      riskScore += 0.15;
    }

    // Check document authenticity scores
    const avgAuthenticity =
      documents.reduce((sum, doc) => sum + doc.analysis.authenticity, 0) /
      documents.length;
    if (avgAuthenticity < 0.6) {
      flags.push("Low document authenticity scores");
      riskScore += 0.25;
    }

    // Check consistency
    const avgConsistency =
      documents.reduce((sum, doc) => sum + doc.analysis.consistency, 0) /
      documents.length;
    if (avgConsistency < 0.5) {
      flags.push("Inconsistent data across documents");
      riskScore += 0.3;
    }

    let riskLevel: "low" | "medium" | "high" = "low";
    if (riskScore > 0.6) riskLevel = "high";
    else if (riskScore > 0.3) riskLevel = "medium";

    return {
      riskLevel,
      flags,
      score: riskScore,
    };
  }
}

// Export the main verifier instance
export const aiVerifier = new LocalAIVerifier();
export { FraudDetector };
export type { VerificationResult, DocumentAnalysis };
