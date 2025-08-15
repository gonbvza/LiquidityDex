// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/contract.sol";
import "./testToken.sol";

/// @title DEX Contract Tests
/// @notice Tests basic functionality of the DEX contract
contract DEXTest is Test {
    DEX dex;
    TestToken token;

    /// @notice Deploys TestToken and DEX, and approves DEX to spend tokens
    function setUp() public {
        token = new TestToken();
        dex = new DEX(address(token));
        token.approve(address(dex), type(uint256).max);
    }

    /// @notice Tests adding liquidity for the first time
    /// @dev Ensures LP tokens are minted correctly
    function testAddLiquidity() public {
        uint256 amountToken = 1_000 ether;
        dex.addLiquidity{value: 1 ether}(amountToken);
        assertEq(dex.balanceOf(address(this)), amountToken);
    }

    /// @notice Tests the calculation of the token/ETH ratio
    /// @dev Ratio = tokens / ETH in the contract
    function testRatio() public {
        uint256 amountToken = 1_000 ether;
        dex.addLiquidity{value: 1 ether}(amountToken);
        uint256 expectedRatio = 1000 / 1; // Simple ratio
        assertEq(dex.getRatio(), expectedRatio);
    }

    /// @notice Tests adding liquidity twice
    /// @dev Ensures LP token balance updates correctly after multiple additions
    function testAddLiquidityTwice() public {
        uint256 amountToken = 1_000 ether;
        dex.addLiquidity{value: 1 ether}(amountToken);
        assertEq(dex.balanceOf(address(this)), amountToken);

        dex.addLiquidity{value: 1 ether}(amountToken);
        assertEq(dex.balanceOf(address(this)), amountToken * 2);
    }

    /// @notice Tests adding insufficient tokens for the liquidity ratio
    /// @dev Should revert with the expected error message
    function testWrongLiquidity() public {
        uint256 amountToken = 1_000 ether;
        dex.addLiquidity{value: 1 ether}(amountToken);
        assertEq(dex.balanceOf(address(this)), amountToken);

        vm.expectRevert(
            "Amount of tokens sent is less than the minimum tokens required"
        );
        dex.addLiquidity{value: 1 ether}(500 ether);
    }
}
