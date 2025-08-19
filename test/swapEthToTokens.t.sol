// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/contract.sol";
import "./testToken.sol";
import "forge-std/console.sol";

/// @title Test swapping eth to tokens
contract swapEthToTokens is Test {
    DEX dex;
    TestToken token;

    /// @notice Deploys TestToken and DEX, and approves DEX to spend tokens
    function setUp() public {
        token = new TestToken();
        dex = new DEX(address(token));
        token.approve(address(dex), type(uint256).max);

        uint256 amountTokens = 1_000 ether;
        dex.addLiquidity{value: 1 ether}(amountTokens);
    }

    function testBasicSwap() public {
        uint256 balanceBefore = ERC20(token).balanceOf(address(this));

        uint256 ethReserve = address(dex).balance; // current reserve
        uint256 tokenReserve = token.balanceOf(address(dex));

        uint256 ethIn = 1 ether;
        uint256 ethInWithFee = (ethIn * 997) / 1000;
        uint256 expectedOut = (tokenReserve * ethInWithFee) /
            (ethReserve + ethInWithFee);

        dex.swapEthToToken{value: ethIn}();

        uint256 balanceAfter = ERC20(token).balanceOf(address(this));

        assertEq(
            balanceBefore + expectedOut,
            balanceAfter,
            "Token balance mismatch"
        );
    }

    function testNoEther() public {
        vm.expectRevert();
        dex.swapEthToToken{value: 0 ether}();
    }
}
