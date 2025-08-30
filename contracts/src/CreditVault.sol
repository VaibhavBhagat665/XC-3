// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./UniversalCarbonCredit.sol";

/**
 * @title XC3USD
 * @dev Stablecoin backed by carbon credits
 */
contract XC3USD is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() ERC20("XC3 USD", "xc3USD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }
}

/**
 * @title CreditVault
 * @dev Lending vault using carbon credits as collateral
 */
contract CreditVault is AccessControl, ReentrancyGuard, ERC1155Holder {
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");

    struct Position {
        address owner;
        uint256 tokenId;
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 lastUpdate;
        bool active;
    }

    UniversalCarbonCredit public immutable creditContract;
    XC3USD public immutable xc3USD;

    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public userPositions;
    
    uint256 private _positionCounter;
    uint256 public constant LTV_RATIO = 6000; // 60% LTV in basis points
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80% liquidation threshold
    uint256 public constant INTEREST_RATE = 800; // 8% annual interest rate
    uint256 public constant CREDIT_PRICE = 25e18; // $25 per credit (18 decimals)

    event PositionCreated(uint256 indexed positionId, address indexed owner, uint256 tokenId, uint256 collateral, uint256 borrowed);
    event PositionRepaid(uint256 indexed positionId, uint256 amount);
    event PositionLiquidated(uint256 indexed positionId, address liquidator);
    event CollateralAdded(uint256 indexed positionId, uint256 amount);

    constructor(address _creditContract) {
        creditContract = UniversalCarbonCredit(_creditContract);
        xc3USD = new XC3USD();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LIQUIDATOR_ROLE, msg.sender);
        
        // Grant minter/burner roles to this contract
        xc3USD.grantRole(xc3USD.MINTER_ROLE(), address(this));
        xc3USD.grantRole(xc3USD.BURNER_ROLE(), address(this));
    }

    /**
     * @dev Deposit carbon credits and borrow xc3USD
     */
    function createPosition(
        uint256 tokenId,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external nonReentrant returns (uint256) {
        require(collateralAmount > 0, "Invalid collateral amount");
        require(creditContract.balanceOf(msg.sender, tokenId) >= collateralAmount, "Insufficient balance");

        uint256 maxBorrow = getMaxBorrowAmount(collateralAmount);
        require(borrowAmount <= maxBorrow, "Borrow amount too high");

        uint256 positionId = ++_positionCounter;

        // Transfer collateral to vault
        creditContract.safeTransferFrom(msg.sender, address(this), tokenId, collateralAmount, "");

        // Create position
        positions[positionId] = Position({
            owner: msg.sender,
            tokenId: tokenId,
            collateralAmount: collateralAmount,
            borrowedAmount: borrowAmount,
            lastUpdate: block.timestamp,
            active: true
        });

        userPositions[msg.sender].push(positionId);

        // Mint xc3USD to borrower
        if (borrowAmount > 0) {
            xc3USD.mint(msg.sender, borrowAmount);
        }

        emit PositionCreated(positionId, msg.sender, tokenId, collateralAmount, borrowAmount);
        return positionId;
    }

    /**
     * @dev Add more collateral to position
     */
    function addCollateral(uint256 positionId, uint256 amount) external nonReentrant {
        Position storage position = positions[positionId];
        require(position.owner == msg.sender, "Not position owner");
        require(position.active, "Position not active");
        require(creditContract.balanceOf(msg.sender, position.tokenId) >= amount, "Insufficient balance");

        creditContract.safeTransferFrom(msg.sender, address(this), position.tokenId, amount, "");
        position.collateralAmount += amount;
        position.lastUpdate = block.timestamp;

        emit CollateralAdded(positionId, amount);
    }

    /**
     * @dev Repay borrowed amount
     */
    function repay(uint256 positionId, uint256 amount) external nonReentrant {
        Position storage position = positions[positionId];
        require(position.owner == msg.sender, "Not position owner");
        require(position.active, "Position not active");
        require(amount <= position.borrowedAmount, "Amount exceeds debt");

        // Calculate interest
        uint256 totalDebt = calculateDebtWithInterest(positionId);
        uint256 repayAmount = amount > totalDebt ? totalDebt : amount;

        // Burn xc3USD
        xc3USD.transferFrom(msg.sender, address(this), repayAmount);
        xc3USD.burn(address(this), repayAmount);

        position.borrowedAmount = totalDebt > repayAmount ? totalDebt - repayAmount : 0;
        position.lastUpdate = block.timestamp;

        // If fully repaid, return collateral
        if (position.borrowedAmount == 0) {
            creditContract.safeTransferFrom(
                address(this),
                msg.sender,
                position.tokenId,
                position.collateralAmount,
                ""
            );
            position.active = false;
        }

        emit PositionRepaid(positionId, repayAmount);
    }

    /**
     * @dev Liquidate undercollateralized position
     */
    function liquidate(uint256 positionId) external onlyRole(LIQUIDATOR_ROLE) nonReentrant {
        Position storage position = positions[positionId];
        require(position.active, "Position not active");

        uint256 healthFactor = getHealthFactor(positionId);
        require(healthFactor < 1e18, "Position is healthy");

        // Transfer collateral to liquidator (could implement auction here)
        creditContract.safeTransferFrom(
            address(this),
            msg.sender,
            position.tokenId,
            position.collateralAmount,
            ""
        );

        position.active = false;
        emit PositionLiquidated(positionId, msg.sender);
    }

    /**
     * @dev Calculate maximum borrow amount for collateral
     */
    function getMaxBorrowAmount(uint256 collateralAmount) public pure returns (uint256) {
        uint256 collateralValue = collateralAmount * CREDIT_PRICE;
        return (collateralValue * LTV_RATIO) / 10000;
    }

    /**
     * @dev Calculate health factor for position
     */
    function getHealthFactor(uint256 positionId) public view returns (uint256) {
        Position memory position = positions[positionId];
        if (!position.active || position.borrowedAmount == 0) {
            return type(uint256).max;
        }

        uint256 collateralValue = position.collateralAmount * CREDIT_PRICE;
        uint256 liquidationValue = (collateralValue * LIQUIDATION_THRESHOLD) / 10000;
        uint256 totalDebt = calculateDebtWithInterest(positionId);

        return (liquidationValue * 1e18) / totalDebt;
    }

    /**
     * @dev Calculate debt with accrued interest
     */
    function calculateDebtWithInterest(uint256 positionId) public view returns (uint256) {
        Position memory position = positions[positionId];
        if (!position.active) return 0;

        uint256 timeElapsed = block.timestamp - position.lastUpdate;
        uint256 interestAccrued = (position.borrowedAmount * INTEREST_RATE * timeElapsed) / (365 days * 10000);
        
        return position.borrowedAmount + interestAccrued;
    }

    /**
     * @dev Get user positions
     */
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    /**
     * @dev Get position details
     */
    function getPosition(uint256 positionId) external view returns (Position memory) {
        return positions[positionId];
    }

    /**
     * @dev Check if position can be liquidated
     */
    function canLiquidate(uint256 positionId) external view returns (bool) {
        return getHealthFactor(positionId) < 1e18;
    }
}
