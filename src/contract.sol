// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "forge-std/console.sol";

/// @title Simple DEX Contract
/// @notice A minimal decentralized exchange allowing users to add and withdraw liquidity
/// @dev Uses ERC20 for LP tokens and works with a single ERC20 token for swaps
contract DEX is ERC20 {
    /// @notice Address of the token this DEX trades
    address public token;

    /// @notice Constructor sets the token to trade and names the LP token
    /// @param _token Address of the ERC20 token to be used in the DEX
    constructor(address _token) ERC20("DEX Token", "DEX") {
        token = _token;
    }

    /// @notice Returns the number of tokens held by the DEX contract
    /// @return The balance of tokens in the contract
    function getTokensInContract() public view returns (uint256) {
        return ERC20(token).balanceOf(address(this));
    }

    /// @notice Allows users to add liquidity to the DEX
    /// @param _amount Amount of tokens to deposit
    /// @dev Users must approve token transfer before calling this function
    /// @return Amount of LP tokens minted to the user
    function addLiquidity(uint256 _amount) public payable returns (uint256) {
        uint256 _liquidity;
        uint256 balanceInEth = address(this).balance;
        uint256 tokenReserve = getTokensInContract();
        ERC20 _token = ERC20(token);

        if (tokenReserve == 0) {
            // Initial liquidity provision
            _token.transferFrom(msg.sender, address(this), _amount);
            _liquidity = balanceInEth;
            _mint(msg.sender, _amount);
        } else {
            uint256 reservedEth = balanceInEth - msg.value;
            uint256 neededTokens = (msg.value * tokenReserve) / reservedEth;
            require(
                _amount >= neededTokens,
                "Amount of tokens sent is less than the minimum tokens required"
            );
            _token.transferFrom(msg.sender, address(this), neededTokens);
            unchecked {
                _liquidity = (totalSupply() * msg.value) / reservedEth;
            }
            _mint(msg.sender, _liquidity);
        }
        return _liquidity;
    }

    /// @notice Allows users to withdraw liquidity from the DEX
    /// @param _amount Amount of LP tokens to burn
    /// @dev Sends proportional ETH and tokens to the user
    function withdrawLiquidity(uint256 _amount) public {
        address payable user = payable(msg.sender);
        require(_amount > 0, "Amount should be greater than zero");

        uint256 totalSupplyLP = totalSupply();
        uint256 totalEth = address(this).balance;
        uint256 userEthereum = (_amount * totalEth) / totalSupplyLP;

        _burn(msg.sender, _amount);

        // Transfer proportional ETH and tokens
        user.transfer(userEthereum);
        ERC20(token).transfer(msg.sender, _amount);
    }

    /// @notice Allows users to swap eth for tokens
    /// @dev Sends proportional tokens to the user
    function swapEthToToken() public payable {
        require(msg.value > 0, "You should send ether to swap");
        uint256 totalTokens = getTokensInContract();
        uint256 reservedEth = address(this).balance - msg.value;
        uint256 k = totalTokens * reservedEth;
        uint256 withdrawTokens = k / address(this).balance;
        console.log("Amount to swap", withdrawTokens);
        ERC20(token).transfer(msg.sender, withdrawTokens);
    }

    /// @notice Allows users to swap tokens for eth
    /// @dev Sends proportional eth to the user
    function swapTokenToEth(uint256 _amount) public payable {
        require(_amount > 0, "You should send ether to swap");
        require(msg.value <= 0, "You can not send any ether");

        uint256 totalTokens = getTokensInContract();
        uint256 reservedEth = address(this).balance;
        uint256 k = totalTokens * reservedEth;
        uint256 withdrawEth = k / (totalTokens + _amount);
        console.log("Ether to send", withdrawEth);
        payable(msg.sender).transfer(withdrawEth);
        ERC20(token).transferFrom(msg.sender, address(this), _amount);
    }

    // ========================
    // Getters
    // ========================

    /// @notice Gets current swap ratio of token to ETH
    /// @return Contract ratio (tokens per 1 ETH)
    function getRatio() public view returns (uint256) {
        return getTokensInContract() / address(this).balance;
    }
}
