// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./UniversalCarbonCredit.sol";

/**
 * @title CarbonRegistry
 * @dev Registry for carbon credit projects with AI verification
 */
contract CarbonRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum ProjectStatus { Submitted, Verified, Rejected, Minted }

    struct Project {
        uint256 id;
        address owner;
        string name;
        string location;
        string methodology;
        uint256 vintageYear;
        uint256 estimatedTCO2e;
        string metadataUri;
        ProjectStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Attestation {
        uint256 projectId;
        uint256 timestamp;
        uint256 scoreBps; // Score in basis points (0-10000)
        string model;
        string explanationUri;
        address verifier;
        bytes signature;
    }

    UniversalCarbonCredit public immutable creditContract;
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Attestation[]) public projectAttestations;
    mapping(uint256 => string[]) public projectDocuments;
    
    uint256 private _projectIdCounter;
    uint256 public constant MIN_VERIFICATION_SCORE = 7500; // 75%

    event ProjectRegistered(uint256 indexed projectId, address indexed owner, string name);
    event DocumentSubmitted(uint256 indexed projectId, string documentCid);
    event ProjectVerified(uint256 indexed projectId, uint256 score, address verifier);
    event ProjectRejected(uint256 indexed projectId, uint256 score, address verifier);
    event CreditsMinted(uint256 indexed projectId, uint256 tokenId, uint256 amount);

    constructor(address _creditContract) {
        creditContract = UniversalCarbonCredit(_creditContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    /**
     * @dev Register a new carbon credit project
     */
    function registerProject(
        string memory name,
        string memory location,
        string memory methodology,
        uint256 vintageYear,
        uint256 estimatedTCO2e,
        string memory metadataUri
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(location).length > 0, "Location required");
        require(vintageYear >= 2000 && vintageYear <= 2030, "Invalid vintage year");
        require(estimatedTCO2e > 0, "Invalid tCO2e amount");

        uint256 projectId = ++_projectIdCounter;
        
        projects[projectId] = Project({
            id: projectId,
            owner: msg.sender,
            name: name,
            location: location,
            methodology: methodology,
            vintageYear: vintageYear,
            estimatedTCO2e: estimatedTCO2e,
            metadataUri: metadataUri,
            status: ProjectStatus.Submitted,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit ProjectRegistered(projectId, msg.sender, name);
        return projectId;
    }

    /**
     * @dev Submit documents for a project
     */
    function submitDocuments(
        uint256 projectId,
        string[] memory documentCids
    ) external {
        Project storage project = projects[projectId];
        require(project.owner == msg.sender, "Not project owner");
        require(project.status == ProjectStatus.Submitted, "Invalid project status");

        for (uint256 i = 0; i < documentCids.length; i++) {
            projectDocuments[projectId].push(documentCids[i]);
            emit DocumentSubmitted(projectId, documentCids[i]);
        }

        project.updatedAt = block.timestamp;
    }

    /**
     * @dev Post AI verification attestation
     */
    function postAttestation(
        uint256 projectId,
        uint256 scoreBps,
        string memory model,
        string memory explanationUri,
        bytes memory signature
    ) external onlyRole(VERIFIER_ROLE) {
        Project storage project = projects[projectId];
        require(project.id != 0, "Project does not exist");
        require(project.status == ProjectStatus.Submitted, "Invalid project status");
        require(scoreBps <= 10000, "Invalid score");

        Attestation memory attestation = Attestation({
            projectId: projectId,
            timestamp: block.timestamp,
            scoreBps: scoreBps,
            model: model,
            explanationUri: explanationUri,
            verifier: msg.sender,
            signature: signature
        });

        projectAttestations[projectId].push(attestation);

        // Update project status based on score
        if (scoreBps >= MIN_VERIFICATION_SCORE) {
            project.status = ProjectStatus.Verified;
            emit ProjectVerified(projectId, scoreBps, msg.sender);
        } else {
            project.status = ProjectStatus.Rejected;
            emit ProjectRejected(projectId, scoreBps, msg.sender);
        }

        project.updatedAt = block.timestamp;
    }

    /**
     * @dev Mint carbon credits for verified project
     */
    function mintCredits(
        uint256 projectId,
        address to,
        uint256 amount
    ) external onlyRole(ISSUER_ROLE) nonReentrant returns (uint256) {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Verified, "Project not verified");
        require(amount <= project.estimatedTCO2e, "Amount exceeds estimate");

        uint256 tokenId = creditContract.mint(
            to,
            projectId,
            amount,
            project.vintageYear,
            project.methodology,
            "XC3 Registry",
            project.metadataUri,
            ""
        );

        project.status = ProjectStatus.Minted;
        project.updatedAt = block.timestamp;

        emit CreditsMinted(projectId, tokenId, amount);
        return tokenId;
    }

    /**
     * @dev Get project info
     */
    function getProject(uint256 projectId) external view returns (Project memory) {
        return projects[projectId];
    }

    /**
     * @dev Get project attestations
     */
    function getProjectAttestations(uint256 projectId) external view returns (Attestation[] memory) {
        return projectAttestations[projectId];
    }

    /**
     * @dev Get project documents
     */
    function getProjectDocuments(uint256 projectId) external view returns (string[] memory) {
        return projectDocuments[projectId];
    }

    /**
     * @dev Get latest attestation for project
     */
    function getLatestAttestation(uint256 projectId) external view returns (Attestation memory) {
        Attestation[] memory attestations = projectAttestations[projectId];
        require(attestations.length > 0, "No attestations found");
        return attestations[attestations.length - 1];
    }

    /**
     * @dev Check if project can be minted
     */
    function canMintCredits(uint256 projectId) external view returns (bool) {
        Project memory project = projects[projectId];
        return project.status == ProjectStatus.Verified;
    }

    /**
     * @dev Get total number of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return _projectIdCounter;
    }
}
