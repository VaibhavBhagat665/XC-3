import { RequestHandler } from "express";
import {
  projectQueries,
  verificationQueries,
  documentQueries,
  activityQueries,
} from "../lib/database";
import { verifyProjectWithGemini } from "../lib/geminiAI";
import { localData } from "../lib/localData";

// Get all projects
export const getProjects: RequestHandler = async (req, res) => {
  try {
    const { status, owner, limit = 50, offset = 0 } = req.query;

    console.log("[DEBUG] Getting projects with filters:", {
      status,
      owner,
      limit,
      offset,
    });

    let projects;
    try {
      // Try database first
      projects = await projectQueries.getAll({
        status: status as string,
        owner: owner as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      console.log("[DEBUG] Database projects fetched:", projects.length);
    } catch (dbError) {
      console.warn(
        "[DEBUG] Database failed, using local data for projects:",
        dbError.message,
      );
      // Fallback to local data
      projects = localData.getProjects({
        status: status as string,
        owner: owner as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      console.log("[DEBUG] Local data projects fetched:", projects.length);
    }

    console.log("[DEBUG] Returning projects:", projects.length);
    res.json({
      success: true,
      data: projects,
      total: projects.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

// Get project by ID
export const getProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const project = await projectQueries.getById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const verifications = await verificationQueries.getByProjectId(projectId);
    const documents = await documentQueries.getByProjectId(projectId);

    res.json({
      success: true,
      data: {
        ...project,
        verifications,
        documents,
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch project",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Create new project
export const createProject: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      methodology,
      vintageYear,
      estimatedTCO2e,
      ownerAddress,
    } = req.body;

    console.log("[DEBUG] Creating project:", { name, location, methodology });

    // Validate required fields
    if (
      !name ||
      !location ||
      !methodology ||
      !vintageYear ||
      !estimatedTCO2e ||
      !ownerAddress
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    let newProject;
    try {
      // Try database first
      newProject = await projectQueries.create({
        name,
        description: description || "",
        location,
        methodology,
        vintage_year: parseInt(vintageYear),
        estimated_tco2e: parseFloat(estimatedTCO2e),
        owner_address: ownerAddress.toLowerCase(),
      });

      // Log activity
      await activityQueries.log({
        user_address: ownerAddress,
        action_type: "project_created",
        project_id: newProject.id,
        details: {
          name: newProject.name,
          estimated_tco2e: newProject.estimated_tco2e,
        },
      });
      console.log("[DEBUG] Project created in database:", newProject.id);
    } catch (dbError) {
      console.warn(
        "[DEBUG] Database failed, using local data for project creation:",
        dbError.message,
      );
      // Fallback to local data
      newProject = localData.addProject({
        name,
        description: description || "",
        location,
        methodology,
        vintage_year: parseInt(vintageYear),
        estimated_tco2e: parseFloat(estimatedTCO2e),
        owner_address: ownerAddress.toLowerCase(),
        status: "draft",
      });

      // Log activity in local data
      localData.addActivity({
        user_address: ownerAddress,
        action_type: "project_created",
        project_id: newProject.id,
        details: {
          name: newProject.name,
          estimated_tco2e: newProject.estimated_tco2e,
        },
      });
      console.log("[DEBUG] Project created in local data:", newProject.id);
    }

    console.log("[DEBUG] Returning created project:", newProject.id);
    res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create project",
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

// Submit project for verification
export const submitProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { documents } = req.body;
    const projectId = parseInt(id);

    const project = await projectQueries.getById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    let updatedProject: any = null;
    try {
      updatedProject = await projectQueries.updateStatus(
        projectId,
        "submitted",
      );
    } catch (dbError: any) {
      console.warn(
        "[DEBUG] Failed to update project status in DB, falling back to local data:",
        dbError?.message || dbError,
      );
      // Fallback to local data update
      updatedProject = localData.updateProject(projectId, {
        status: "submitted",
      }) || {
        ...project,
        status: "submitted",
      };
    }

    // Add documents if provided (best-effort; ignore failures)
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        try {
          await documentQueries.create({
            project_id: projectId,
            file_name: doc.fileName,
            file_type: doc.fileType,
            ipfs_hash: doc.ipfsHash,
            file_size: doc.fileSize || 0,
          });
        } catch (docErr: any) {
          console.warn(
            "[DEBUG] Failed to persist document record:",
            docErr?.message || docErr,
          );
        }
      }
    }

    // Log activity (best-effort)
    try {
      await activityQueries.log({
        user_address: project.owner_address,
        action_type: "project_submitted",
        project_id: projectId,
        details: {
          documents_count: documents ? documents.length : 0,
        },
      });
    } catch (actErr: any) {
      console.warn(
        "[DEBUG] Failed to write activity to DB; logging locally:",
        actErr?.message || actErr,
      );
      localData.addActivity({
        user_address: project.owner_address,
        action_type: "project_submitted",
        project_id: projectId,
        details: {
          documents_count: documents ? documents.length : 0,
        },
      });
    }

    res.json({
      success: true,
      data: updatedProject,
      message: "Project submitted for verification",
    });
  } catch (error) {
    console.error("Error submitting project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit project",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Start verification process
export const startVerification: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const project = await projectQueries.getById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    if (project.status !== "submitted") {
      return res.status(400).json({
        success: false,
        error: "Project must be submitted before verification",
      });
    }

    // Get project documents for AI analysis
    const documents = await documentQueries.getByProjectId(projectId);

    // Perform AI verification with Gemini
    const aiVerification = await verifyProjectWithGemini(project, documents);

    const isPass = aiVerification.recommendation === "approve";
    const score = aiVerification.overallScore / 100; // Convert to 0-1 scale

    // Create verification record
    const verification = await verificationQueries.create({
      project_id: projectId,
      score,
      model_used: aiVerification.modelUsed,
      explanation:
        aiVerification.documentAnalyses[0]?.explanation ||
        "AI verification completed",
      artifacts_ipfs_hash: `analysis_${aiVerification.analysisId}`,
      verifier_signature: `gemini_${aiVerification.analysisId}`,
    });

    // Update project status
    const updatedProject = await projectQueries.updateStatus(
      projectId,
      isPass ? "verified" : "rejected",
    );

    // Log activity
    await activityQueries.log({
      user_address: project.owner_address,
      action_type: isPass ? "project_verified" : "project_rejected",
      project_id: projectId,
      details: {
        score,
        model_used: aiVerification.modelUsed,
        processing_time: aiVerification.processingTime,
        documents_analyzed: documents.length,
        risk_level: aiVerification.riskAssessment.level,
      },
    });

    res.json({
      success: true,
      data: {
        verification: {
          ...verification,
          confidence: score,
          processingTime: aiVerification.processingTime,
          documentAnalyses: aiVerification.documentAnalyses,
          riskAssessment: aiVerification.riskAssessment,
          recommendation: aiVerification.recommendation,
          analysisId: aiVerification.analysisId,
        },
        newStatus: updatedProject.status,
        project: updatedProject,
      },
      message: `Project ${isPass ? "verified" : "rejected"} with score ${(score * 100).toFixed(1)}% (${aiVerification.processingTime}ms) using ${aiVerification.modelUsed}`,
    });
  } catch (error) {
    console.error("Error starting verification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start verification",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Get project metrics
export const getProjectMetrics: RequestHandler = async (req, res) => {
  try {
    console.log("[DEBUG] Getting project metrics");

    let allProjects;
    let allVerifications = [];
    try {
      // Try database first
      allProjects = await projectQueries.getAll({ limit: 1000, offset: 0 });
      allVerifications = await verificationQueries.getByProjectId(0); // Get all verifications
      console.log(
        "[DEBUG] Database metrics fetched:",
        allProjects.length,
        "projects",
      );
    } catch (dbError) {
      console.warn(
        "[DEBUG] Database failed, using local data for metrics:",
        dbError.message,
      );
      // Fallback to local data
      allProjects = localData.getProjects({ limit: 1000, offset: 0 });
      allVerifications = []; // No verifications in local data
    }

    const totalProjects = allProjects.length;
    const verifiedProjects = allProjects.filter(
      (p) => p.status === "verified",
    ).length;
    const totalEstimatedCredits = allProjects.reduce(
      (sum, p) => sum + parseFloat((p.estimated_tco2e || 0).toString()),
      0,
    );
    const avgVerificationScore =
      allVerifications.length > 0
        ? allVerifications.reduce((sum, v) => sum + v.score, 0) /
          allVerifications.length
        : 0.85;

    const metrics = {
      totalProjects,
      verifiedProjects,
      pendingProjects: allProjects.filter((p) => p.status === "submitted")
        .length,
      draftProjects: allProjects.filter((p) => p.status === "draft").length,
      rejectedProjects: allProjects.filter((p) => p.status === "rejected")
        .length,
      mintedProjects: allProjects.filter((p) => p.status === "minted").length,
      totalEstimatedCredits,
      averageVerificationScore: avgVerificationScore,
      recentActivity: allVerifications.slice(-5),
    };

    console.log("[DEBUG] Returning metrics:", metrics);
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching project metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch project metrics",
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};
