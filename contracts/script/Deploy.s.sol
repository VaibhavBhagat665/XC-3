// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UniversalCarbonCredit.sol";
import "../src/CarbonRegistry.sol";
import "../src/CreditVault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy UniversalCarbonCredit
        UniversalCarbonCredit creditContract = new UniversalCarbonCredit();
        console.log("UniversalCarbonCredit deployed at:", address(creditContract));

        // Deploy CarbonRegistry
        CarbonRegistry registry = new CarbonRegistry(address(creditContract));
        console.log("CarbonRegistry deployed at:", address(registry));

        // Deploy CreditVault
        CreditVault vault = new CreditVault(address(creditContract));
        console.log("CreditVault deployed at:", address(vault));
        console.log("XC3USD deployed at:", address(vault.xc3USD()));

        // Grant roles
        creditContract.grantRole(creditContract.MINTER_ROLE(), address(registry));
        creditContract.grantRole(creditContract.BURNER_ROLE(), address(vault));
        
        registry.grantRole(registry.ISSUER_ROLE(), vm.addr(deployerPrivateKey));
        registry.grantRole(registry.VERIFIER_ROLE(), vm.addr(deployerPrivateKey));

        console.log("Deployment completed!");
        console.log("Set these in your environment:");
        console.log("CREDIT_CONTRACT=", address(creditContract));
        console.log("REGISTRY_CONTRACT=", address(registry));
        console.log("VAULT_CONTRACT=", address(vault));
        console.log("XC3USD_CONTRACT=", address(vault.xc3USD()));

        vm.stopBroadcast();
    }
}
