// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/contract.sol";
import "./testToken.sol";
import "forge-std/console.sol";

/// @title Withdraw Liquidity Tests for DEX
/// @notice Tests the withdrawal functionality of the DEX contract
contract withdrawTest is Test {
    DEX dex;
    TestToken token;

    /// @notice Receive function to allow test contract to accept ETH
    receive() external payable {}

    /// @notice Sets up the test environment
    /// @dev Deploys TestToken, DEX, approves DEX to spend tokens, and adds initial liquidity
    function setUp() public {
        token = new TestToken();
        dex = new DEX(address(token));
        token.approve(address(dex), type(uint256).max);

        uint256 amountToken = 1_000_000 ether; // Initial token liquidity
        dex.addLiquidity{value: 1 ether}(amountToken);
    }

    /// @notice Tests that withdrawing zero liquidity reverts
    /// @dev Should revert with "Amount should be greater than zero"
    function testWithdrawZero() public {
        vm.expectRevert("Amount should be greater than zero");
        dex.withdrawLiquidity(0);
    }

    /// @notice Tests withdrawing a valid amount of liquidity
    /// @dev Checks that the ETH and token balances are updated correctly
    function testWithdrawSimple() public {
        uint256 amountLP = 500_000 ether;
        uint256 balanceBefore = address(this).balance;

        dex.withdrawLiquidity(amountLP);

        uint256 balanceAfter = address(this).balance;
        console.log("Test contract ETH balance after withdrawal", balanceAfter);

        assertEq(
            balanceBefore + 0.5 ether,
            balanceAfter,
            "ETH balance did not increase correctly"
        );
        assertEq(
            token.balanceOf(address(this)),
            500_000 ether,
            "Token balance after withdrawal is incorrect"
        );
    }
}
