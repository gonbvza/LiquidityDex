// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/contract.sol";
import "./testToken.sol";
import "forge-std/console.sol";

/// @title Withdraw Liquidity Tests for DEX
/// @notice Tests the withdrawal functionality of the DEX contract
contract swapTokensToEth is Test {
    DEX dex;
    TestToken token;

    /// @notice Receive function to allow test contract to accept ETH
    receive() external payable {}

    /// @notice Deploys TestToken and DEX, and approves DEX to spend tokens
    function setUp() public {
        token = new TestToken();
        dex = new DEX(address(token));
        token.approve(address(dex), type(uint256).max);

        uint256 amountTokens = 1_000 ether;
        dex.addLiquidity{value: 1 ether}(amountTokens);
    }

    function testSimpleSwap() public {
        uint256 amountLP = 1_000 ether;
        uint256 balanceBefore = address(this).balance;
        dex.swapTokenToEth(amountLP);
        uint256 balanceAfter = address(this).balance;

        assertEq(
            balanceBefore + 0.5 ether,
            balanceAfter,
            "ETH balance did not increase correctly"
        );
    }

    function testDoubleSwap() public {
        uint256 amountLP = 1_000 ether;
        uint256 balanceBefore = address(this).balance;
        dex.swapTokenToEth(amountLP);
        dex.swapTokenToEth(amountLP * 2);
        uint256 balanceAfter = address(this).balance;

        assertEq(
            balanceBefore + 0.75 ether,
            balanceAfter,
            "ETH balance did not increase correctly"
        );
    }
}
