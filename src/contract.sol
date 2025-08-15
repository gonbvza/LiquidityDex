// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DEX is ERC20 {
    address public token;

    constructor(address _token) ERC20("DEX Token", "DEX") {
        token = _token;
    }
}
