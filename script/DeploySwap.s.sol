// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/contract.sol";

contract DeployDEX is Script {
    function run() external {
        address existingToken = address(vm.envAddress("TOKEN"));
        vm.startBroadcast();
        DEX dex = new DEX(existingToken);
        console.log("DEX deployed at:", address(dex));
        vm.stopBroadcast();
    }
}
