// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title UniversalCarbonCredit
 * @dev ERC1155 token for carbon credits with cross-chain compatibility
 */
contract UniversalCarbonCredit is ERC1155, AccessControl, ERC1155Supply {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    struct CreditMetadata {
        uint256 projectId;
        uint256 tCO2e;
        uint256 vintageYear;
        string methodology;
        string issuer;
        string uri;
        bool retired;
    }

    mapping(uint256 => CreditMetadata) public creditMetadata;
    mapping(uint256 => uint256) public totalRetired;
    
    uint256 private _currentTokenId;
    
    event CreditMinted(uint256 indexed tokenId, uint256 indexed projectId, uint256 amount, address to);
    event CreditRetired(uint256 indexed tokenId, uint256 amount, address by, string reason);
    event MetadataUpdated(uint256 indexed tokenId, string newUri);

    constructor() ERC1155("https://api.xc3.app/metadata/{id}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    /**
     * @dev Mint carbon credits
     */
    function mint(
        address to,
        uint256 projectId,
        uint256 tCO2e,
        uint256 vintageYear,
        string memory methodology,
        string memory issuer,
        string memory tokenUri,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = ++_currentTokenId;
        
        creditMetadata[tokenId] = CreditMetadata({
            projectId: projectId,
            tCO2e: tCO2e,
            vintageYear: vintageYear,
            methodology: methodology,
            issuer: issuer,
            uri: tokenUri,
            retired: false
        });

        _mint(to, tokenId, tCO2e, data);
        
        emit CreditMinted(tokenId, projectId, tCO2e, to);
        return tokenId;
    }

    /**
     * @dev Retire (burn) carbon credits
     */
    function retire(
        uint256 tokenId,
        uint256 amount,
        string memory reason
    ) external {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");

        _burn(msg.sender, tokenId, amount);
        totalRetired[tokenId] += amount;

        emit CreditRetired(tokenId, amount, msg.sender, reason);
    }

    /**
     * @dev Batch retire multiple credits
     */
    function retireBatch(
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        string memory reason
    ) external {
        require(tokenIds.length == amounts.length, "Arrays length mismatch");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(balanceOf(msg.sender, tokenIds[i]) >= amounts[i], "Insufficient balance");
            totalRetired[tokenIds[i]] += amounts[i];
            emit CreditRetired(tokenIds[i], amounts[i], msg.sender, reason);
        }

        _burnBatch(msg.sender, tokenIds, amounts);
    }

    /**
     * @dev Get token URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        CreditMetadata memory metadata = creditMetadata[tokenId];
        if (bytes(metadata.uri).length > 0) {
            return metadata.uri;
        }
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString()));
    }

    /**
     * @dev Update token URI (only admin)
     */
    function updateTokenURI(uint256 tokenId, string memory newUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        creditMetadata[tokenId].uri = newUri;
        emit MetadataUpdated(tokenId, newUri);
    }

    /**
     * @dev Get credit info
     */
    function getCreditInfo(uint256 tokenId) external view returns (CreditMetadata memory) {
        return creditMetadata[tokenId];
    }

    /**
     * @dev Check if credit exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return creditMetadata[tokenId].projectId != 0;
    }

    // Required overrides
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
