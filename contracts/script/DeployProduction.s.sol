// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/UniversalCarbonCredit.sol";
import "../src/CarbonRegistry.sol";
import "../src/CreditVault.sol";

contract DeployProduction is Script {
    // Configuration
    string constant BASE_URI = "https://api.xc3.app/metadata/";
    uint256 constant MIN_VERIFICATION_SCORE = 7500; // 75% in basis points
    
    function run() external {
        // Get deployment key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy UniversalCarbonCredit
        UniversalCarbonCredit creditContract = new UniversalCarbonCredit(BASE_URI);
        console.log("UniversalCarbonCredit deployed to:", address(creditContract));
        
        // 2. Deploy CarbonRegistry with credit contract address
        CarbonRegistry registry = new CarbonRegistry(
            address(creditContract),
            MIN_VERIFICATION_SCORE
        );
        console.log("CarbonRegistry deployed to:", address(registry));
        
        // 3. Deploy CreditVault with credit contract address
        CreditVault vault = new CreditVault(address(creditContract));
        console.log("CreditVault deployed to:", address(vault));
        
        // 4. Grant necessary roles
        
        // Grant MINTER_ROLE to registry so it can mint credits
        creditContract.grantRole(creditContract.MINTER_ROLE(), address(registry));
        console.log("Granted MINTER_ROLE to registry");
        
        // Grant BURNER_ROLE to vault for liquidations
        creditContract.grantRole(creditContract.BURNER_ROLE(), address(vault));
        console.log("Granted BURNER_ROLE to vault");
        
        // Grant VERIFIER_ROLE to deployer (can be changed later)
        registry.grantRole(registry.VERIFIER_ROLE(), deployer);
        console.log("Granted VERIFIER_ROLE to deployer");
        
        // Grant ISSUER_ROLE to deployer (can be changed later)
        registry.grantRole(registry.ISSUER_ROLE(), deployer);
        console.log("Granted ISSUER_ROLE to deployer");
        
        vm.stopBroadcast();
        
        // Output deployment addresses for environment configuration
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Network:", block.chainid);
        console.log("UniversalCarbonCredit:", address(creditContract));
        console.log("CarbonRegistry:", address(registry));
        console.log("CreditVault:", address(vault));
        
        console.log("\n=== ENVIRONMENT VARIABLES ===");
        console.log("Add these to your .env file:");
        
        if (block.chainid == 7001) {
            // ZetaChain Testnet
            console.log("VITE_ZETA_TESTNET_CREDITS=", address(creditContract));
            console.log("VITE_ZETA_TESTNET_REGISTRY=", address(registry));
            console.log("VITE_ZETA_TESTNET_VAULT=", address(vault));
        } else if (block.chainid == 11155111) {
            // Sepolia
            console.log("VITE_SEPOLIA_CREDITS=", address(creditContract));
            console.log("VITE_SEPOLIA_REGISTRY=", address(registry));
            console.log("VITE_SEPOLIA_VAULT=", address(vault));
        } else if (block.chainid == 80002) {
            // Polygon Amoy
            console.log("VITE_POLYGON_AMOY_CREDITS=", address(creditContract));
            console.log("VITE_POLYGON_AMOY_REGISTRY=", address(registry));
            console.log("VITE_POLYGON_AMOY_VAULT=", address(vault));
        } else {
            console.log("CREDITS_CONTRACT=", address(creditContract));
            console.log("REGISTRY_CONTRACT=", address(registry));
            console.log("VAULT_CONTRACT=", address(vault));
        }
        
        console.log("\n=== VERIFICATION ===");
        console.log("Verify contracts on block explorer with these commands:");
        console.log("forge verify-contract", address(creditContract), "src/UniversalCarbonCredit.sol:UniversalCarbonCredit --chain-id", block.chainid, "--constructor-args", abi.encode(BASE_URI));
        console.log("forge verify-contract", address(registry), "src/CarbonRegistry.sol:CarbonRegistry --chain-id", block.chainid, "--constructor-args", abi.encode(address(creditContract), MIN_VERIFICATION_SCORE));
        console.log("forge verify-contract", address(vault), "src/CreditVault.sol:CreditVault --chain-id", block.chainid, "--constructor-args", abi.encode(address(creditContract)));
    }
}
