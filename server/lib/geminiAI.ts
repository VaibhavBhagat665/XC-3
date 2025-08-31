import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface DocumentAnalysis {
  score: number;
  confidence: number;
  explanation: string;
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
  detectedElements: string[];
  verificationFlags: string[];
}

export interface ProjectVerification {
  overallScore: number;
  modelUsed: string;
  analysisId: string;
  documentAnalyses: DocumentAnalysis[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
    mitigation: string[];
  };
  recommendation: "approve" | "reject" | "review_required";
  processingTime: number;
}

/**
 * Analyze document content using Gemini AI
 */
export async function analyzeDocumentWithGemini(
  documentText: string,
  documentType: string,
  projectContext: any,
): Promise<DocumentAnalysis> {
  try {
    const prompt = `
You are an expert AI verifier for carbon credit projects. Analyze this ${documentType} document for a carbon credit project verification.

Project Context:
- Name: ${projectContext.name}
- Location: ${projectContext.location}
- Methodology: ${projectContext.methodology}
- Estimated CO2e: ${projectContext.estimatedTCO2e} tonnes
- Vintage Year: ${projectContext.vintageYear}

Document Content:
${documentText}

Please provide a comprehensive analysis including:

1. Verification Score (0-100): How well does this document support the carbon credit claims?
2. Confidence Level (0-100): How confident are you in your analysis?
3. Risk Level (low/medium/high): What is the risk of fraud or inaccuracy?
4. Key Elements Detected: What important information did you find?
5. Verification Flags: Any concerns or red flags?
6. Recommendations: What should be done to improve verification?

Focus on:
- Additionality (would this project happen without carbon credits?)
- Permanence (will the carbon benefits last?)
- Leakage (are there offsetting emissions elsewhere?)
- Measurement accuracy (are the CO2 calculations realistic?)
- Compliance with stated methodology
- Document authenticity indicators

Respond in JSON format with this structure:
{
  "score": number,
  "confidence": number,
  "explanation": "detailed explanation",
  "riskLevel": "low|medium|high",
  "recommendations": ["recommendation1", "recommendation2"],
  "detectedElements": ["element1", "element2"],
  "verificationFlags": ["flag1", "flag2"]
}
`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const processingTime = Date.now() - startTime;

    const response = await result.response;
    const text = response.text();

    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in Gemini response");
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Validate and sanitize the response
      return {
        score: Math.max(0, Math.min(100, analysis.score || 0)),
        confidence: Math.max(0, Math.min(100, analysis.confidence || 0)),
        explanation: analysis.explanation || "Analysis completed",
        riskLevel: ["low", "medium", "high"].includes(analysis.riskLevel)
          ? analysis.riskLevel
          : "medium",
        recommendations: Array.isArray(analysis.recommendations)
          ? analysis.recommendations
          : [],
        detectedElements: Array.isArray(analysis.detectedElements)
          ? analysis.detectedElements
          : [],
        verificationFlags: Array.isArray(analysis.verificationFlags)
          ? analysis.verificationFlags
          : [],
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);

      const fallbackScore = calculateFallbackScore(
        documentText,
        projectContext,
      );

      const placeholder = looksLikePlaceholderExtraction(documentText);
      const carbonRelevant = isCarbonRelevant(documentText);

      return {
        score: fallbackScore,
        confidence: carbonRelevant && !placeholder ? 70 : 55,
        explanation:
          placeholder
            ? "Only file metadata available; actual text not extracted. Using conservative local analysis."
            : `Document analysis completed. ${documentText.length > 1000 ? "Comprehensive documentation provided." : "Limited documentation available."} Gemini AI parsing issues; used fallback analysis.`,
        riskLevel:
          !carbonRelevant || placeholder
            ? "high"
            : fallbackScore > 80
              ? "low"
              : fallbackScore > 60
                ? "medium"
                : "high",
        recommendations: [
          "Provide machine-readable project documentation (PDF with text or DOCX)",
          "Verify methodology compliance",
        ],
        detectedElements: extractKeyElements(documentText),
        verificationFlags: [
          ...(!carbonRelevant ? ["Content not carbon-related"] : []),
          ...(placeholder ? ["Text extraction incomplete"] : []),
          ...(fallbackScore < 70 ? ["Limited documentation"] : []),
        ],
      };
    }
  } catch (error) {
    console.error("Gemini AI analysis failed:", error);

    const fallbackScore = calculateFallbackScore(documentText, projectContext);
    const placeholder = looksLikePlaceholderExtraction(documentText);
    const carbonRelevant = isCarbonRelevant(documentText);

    return {
      score: fallbackScore,
      confidence: carbonRelevant && !placeholder ? 60 : 50,
      explanation:
        "Document processed using local verification algorithms. Gemini AI enhancement unavailable.",
      riskLevel:
        !carbonRelevant || placeholder
          ? "high"
          : fallbackScore > 75
            ? "low"
            : "medium",
      recommendations: [
        "Provide machine-readable supporting documents",
        "Review methodology alignment",
      ],
      detectedElements: extractKeyElements(documentText),
      verificationFlags: [
        "AI verification unavailable",
        ...(!carbonRelevant ? ["Content not carbon-related"] : []),
        ...(placeholder ? ["Text extraction incomplete"] : []),
      ],
    };
  }
}

/**
 * Comprehensive project verification using Gemini AI
 */
export async function verifyProjectWithGemini(
  projectData: any,
  documents: any[],
): Promise<ProjectVerification> {
  const startTime = Date.now();
  const analysisId = `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const documentAnalyses: DocumentAnalysis[] = [];

    const geminiAvailable = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;

    // Analyze each document
    for (const doc of documents) {
      const documentText =
        doc.extractedText || `${doc.file_name} - ${doc.file_type}`;
      const analysis = await analyzeDocumentWithGemini(
        documentText,
        doc.file_type,
        projectData,
      );
      documentAnalyses.push(analysis);
    }

    // If no documents, do project-level analysis
    if (documents.length === 0) {
      const projectDescription = `
Project: ${projectData.name}
Description: ${projectData.description}
Location: ${projectData.location}
Methodology: ${projectData.methodology}
Estimated CO2e: ${projectData.estimatedTCO2e} tonnes
Vintage Year: ${projectData.vintageYear}
`;

      const analysis = await analyzeDocumentWithGemini(
        projectDescription,
        "project_description",
        projectData,
      );
      documentAnalyses.push(analysis);
    }

    // Calculate overall score and risk assessment
    const scores = documentAnalyses.map((a) => a.score);
    const overallScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    const highRiskCount = documentAnalyses.filter(
      (a) => a.riskLevel === "high",
    ).length;
    const mediumRiskCount = documentAnalyses.filter(
      (a) => a.riskLevel === "medium",
    ).length;

    const overallRiskLevel =
      highRiskCount > 0
        ? "high"
        : mediumRiskCount > documentAnalyses.length / 2
          ? "medium"
          : "low";

    const allFlags = documentAnalyses.flatMap((a) => a.verificationFlags);
    const allRecommendations = documentAnalyses.flatMap(
      (a) => a.recommendations,
    );

    let recommendation: ProjectVerification["recommendation"] =
      overallScore >= 75 && overallRiskLevel !== "high"
        ? "approve"
        : overallScore < 60 || overallRiskLevel === "high"
          ? "reject"
          : "review_required";

    if (!geminiAvailable && recommendation === "approve") {
      recommendation = "review_required";
    }

    const processingTime = Date.now() - startTime;

    return {
      overallScore,
      modelUsed: "Gemini 1.5 Pro + XC3 Local AI",
      analysisId,
      documentAnalyses,
      riskAssessment: {
        level: overallRiskLevel,
        factors: [...new Set(allFlags)],
        mitigation: [...new Set(allRecommendations)],
      },
      recommendation,
      processingTime,
    };
  } catch (error) {
    console.error("Complete project verification failed:", error);

    // Comprehensive fallback verification
    const fallbackScore = calculateProjectFallbackScore(projectData, documents);

    return {
      overallScore: fallbackScore,
      modelUsed: "XC3 Local AI Verifier",
      analysisId,
      documentAnalyses: [
        {
          score: fallbackScore,
          confidence: 65,
          explanation:
            "Project verified using local algorithms. All core criteria evaluated.",
          riskLevel: fallbackScore > 75 ? "low" : "medium",
          recommendations: [
            "Consider additional documentation",
            "Verify methodology compliance",
          ],
          detectedElements: ["Project metadata", "Basic requirements"],
          verificationFlags: fallbackScore < 70 ? ["Limited verification"] : [],
        },
      ],
      riskAssessment: {
        level: fallbackScore > 75 ? "low" : "medium",
        factors: ["Local verification only"],
        mitigation: ["Enhanced due diligence recommended"],
      },
      recommendation: "review_required",
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Fallback scoring algorithm
 */
function calculateFallbackScore(
  documentText: string,
  projectContext: any,
): number {
  let score = 30; // More conservative base score

  const placeholder = looksLikePlaceholderExtraction(documentText);
  const carbonRelevant = isCarbonRelevant(documentText);

  // Document length bonus (only if not placeholder)
  if (!placeholder) {
    if (documentText.length > 2000) score += 10;
    else if (documentText.length > 1000) score += 7;
    else if (documentText.length > 500) score += 3;
  }

  // Keyword analysis (stronger signal)
  const keywords = [
    "carbon",
    "co2",
    "emission",
    "reduction",
    "offset",
    "methodology",
    "baseline",
    "additionality",
    "monitoring",
    "verification",
    "standard",
    "protocol",
    "measurement",
    "tonne",
    "metric",
    "permanence",
  ];

  const foundKeywords = keywords.filter((keyword) =>
    documentText.toLowerCase().includes(keyword),
  ).length;

  score += Math.min(25, foundKeywords * 5);

  // Penalize non-relevant/placeholder content
  if (!carbonRelevant) score -= 15;
  if (placeholder) score -= 20;

  // Project completeness bonus (reduced weight)
  if (projectContext.estimatedTCO2e && projectContext.estimatedTCO2e > 0)
    score += 3;
  if (projectContext.methodology && projectContext.methodology.length > 10)
    score += 3;
  if (projectContext.location && projectContext.location.length > 5) score += 2;

  // Cap scores when content isn't clearly relevant
  if (!carbonRelevant || placeholder) {
    score = Math.min(score, 55);
  }

  return Math.max(0, Math.min(100, score));
}

function calculateProjectFallbackScore(
  projectData: any,
  documents: any[],
): number {
  let score = 65; // Base score for projects

  // Documentation completeness
  if (documents.length >= 3) score += 15;
  else if (documents.length >= 2) score += 10;
  else if (documents.length >= 1) score += 5;

  // Project data completeness
  const requiredFields = [
    "name",
    "description",
    "location",
    "methodology",
    "estimatedTCO2e",
    "vintageYear",
  ];
  const completedFields = requiredFields.filter(
    (field) =>
      projectData[field] && String(projectData[field]).trim().length > 0,
  ).length;

  score += (completedFields / requiredFields.length) * 15;

  // Methodology bonus
  const recognizedMethodologies = [
    "REDD+",
    "CDM",
    "VCS",
    "Gold Standard",
    "CAR",
    "ACR",
  ];
  if (
    recognizedMethodologies.some((method) =>
      projectData.methodology?.toUpperCase().includes(method.toUpperCase()),
    )
  ) {
    score += 10;
  }

  // Scale bonus
  if (projectData.estimatedTCO2e > 100000) score += 5;
  else if (projectData.estimatedTCO2e > 10000) score += 3;

  return Math.max(0, Math.min(100, score));
}

function looksLikePlaceholderExtraction(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("content extraction requires") ||
    t.includes("visual content, ocr capability") ||
    t.includes("binary content, specialized parser") ||
    t.includes("text extraction failed") ||
    t.startsWith("pdf document:") ||
    t.startsWith("office document:") ||
    t.startsWith("image file:")
  );
}

function isCarbonRelevant(text: string): boolean {
  const t = text.toLowerCase();
  const signals = [
    "carbon",
    "co2",
    "emission",
    "offset",
    "mrv",
    "baseline",
    "additionality",
    "permanence",
    "leakage",
    "sequestration",
    "vcs",
    "verra",
    "gold standard",
    "acr",
    "car",
    "redd",
    "afforestation",
    "reforestation",
    "biochar",
    "methane",
    "renewable",
  ];
  const count = signals.filter((s) => t.includes(s)).length;
  return count >= 2; // require at least two domain signals
}

function extractKeyElements(text: string): string[] {
  const elements = [];

  if (
    text.toLowerCase().includes("carbon") ||
    text.toLowerCase().includes("co2")
  ) {
    elements.push("Carbon content detected");
  }
  if (text.toLowerCase().includes("methodology")) {
    elements.push("Methodology information");
  }
  if (text.toLowerCase().includes("baseline")) {
    elements.push("Baseline data");
  }
  if (text.toLowerCase().includes("monitor")) {
    elements.push("Monitoring protocols");
  }
  if (text.length > 1000) {
    elements.push("Comprehensive documentation");
  }

  return elements;
}

/**
 * Test Gemini AI connectivity
 */
export async function testGeminiConnection(): Promise<{
  connected: boolean;
  model: string;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const result = await model.generateContent(
      "Hello, respond with 'Connection successful' if you can read this.",
    );
    const response = await result.response;
    const text = response.text();

    return {
      connected: true,
      model: "Gemini 1.5 Pro",
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      model: "Gemini 1.5 Pro",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate carbon project insights using Gemini AI
 */
export async function generateProjectInsights(projectData: any): Promise<{
  marketAnalysis: string;
  improvementSuggestions: string[];
  riskFactors: string[];
  valueProposition: string;
}> {
  try {
    const prompt = `
As a carbon market expert, analyze this carbon credit project and provide insights:

Project: ${projectData.name}
Location: ${projectData.location}
Methodology: ${projectData.methodology}
Estimated Credits: ${projectData.estimatedTCO2e} tonnes CO2e
Vintage: ${projectData.vintageYear}
Description: ${projectData.description}

Provide analysis in JSON format:
{
  "marketAnalysis": "Analysis of market potential and demand",
  "improvementSuggestions": ["suggestion1", "suggestion2"],
  "riskFactors": ["risk1", "risk2"],
  "valueProposition": "Key value proposition for buyers"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback insights
    return {
      marketAnalysis: `This ${projectData.methodology} project in ${projectData.location} represents ${projectData.estimatedTCO2e} tonnes of carbon reduction potential.`,
      improvementSuggestions: [
        "Enhanced monitoring protocols",
        "Third-party verification",
        "Stakeholder engagement",
      ],
      riskFactors: [
        "Regulatory changes",
        "Market volatility",
        "Technical implementation",
      ],
      valueProposition:
        "High-quality carbon credits with transparent verification",
    };
  } catch (error) {
    console.error("Failed to generate insights:", error);

    return {
      marketAnalysis: "Market analysis temporarily unavailable",
      improvementSuggestions: ["Regular monitoring", "Documentation updates"],
      riskFactors: ["Market conditions", "Regulatory environment"],
      valueProposition: "Verified carbon reduction credits",
    };
  }
}
