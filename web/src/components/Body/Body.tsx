import React, { useEffect, useState } from "react";
import { addressShortener } from "../../utils/Address";
import { formatEther, JsonRpcProvider, Contract } from "ethers";
import { ABIS } from "../../assets/SwapContractAbi";
import { addLiquidity, executeSwap } from "../../utils/contract";
import { ERC20_TOKEN, RPC_URL, SWAP_CONTRACT } from "../../utils/constants";
import { connectWallet } from "../../utils/connectWallet";

/**
 * Body component renders the main DEX UI for swapping tokens and adding liquidity.
 */
const Body = () => {
  const [fromToken, setFromToken] = useState({
    symbol: "ETH",
    name: "Ethereum",
    balance: "0",
  });
  const [toToken, setToToken] = useState({
    symbol: "ImuLL",
    name: "ImuLL token",
    balance: "0",
  });
  const [swapContractBalance, setSwapContractBalance] = useState({
    eth: "",
    token: "",
  });
  const [tokenLiquidity, setTokenLiquidity] = useState(0);
  const [ethLiquidity, setEthLiquidity] = useState(0);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [swapRatio, setSwapRatio] = useState("");

  /**
   * Fetches DEX contract balances and current swap ratio on mount.
   */
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const provider = new JsonRpcProvider(RPC_URL);
        const tokenContract = new Contract(ERC20_TOKEN, ABIS.ERC20, provider);

        const ethBalance = Number(
          formatEther(await provider.getBalance(SWAP_CONTRACT)),
        ).toFixed(3);

        const tokenRawBalance = await tokenContract.balanceOf(SWAP_CONTRACT);
        const tokenBalance = formatEther(tokenRawBalance.toString());

        setSwapContractBalance({
          token: tokenBalance.toString(),
          eth: ethBalance,
        });

        const dexContract = new Contract(
          SWAP_CONTRACT,
          ABIS.Contract,
          provider,
        );
        const ratio = Number(await dexContract.getRatio()).toString();
        setSwapRatio(ratio);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  /**
   * Swaps `fromToken` and `toToken` states including their amounts.
   */
  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  /**
   * Handles change in `fromAmount` input and auto-calculates `toAmount`.
   */
  const handleFromAmountChange = (e: any) => {
    const value = e.target.value;
    setFromAmount(value);
    if (value && !isNaN(value)) {
      const rate =
        fromToken.symbol === "ETH" ? Number(swapRatio) : 1 / Number(swapRatio);
      setToAmount((parseFloat(value) * rate).toFixed(6));
    } else {
      setToAmount("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700/50 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  LiquiditySwap
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                connectWallet({
                  setWalletAddress,
                  setFromToken,
                  setToToken,
                  fromToken,
                  toToken,
                })
              }
              className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>
                {walletAddress
                  ? addressShortener(walletAddress)
                  : "Connect Wallet"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Main Swap Interface */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Swap</h2>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                ></button>
              </div>

              {/* From Token */}
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-sm">From</span>
                    <span className="text-gray-400 text-sm">
                      Balance: {fromToken.balance}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={handleFromAmountChange}
                      className="flex-1 bg-transparent text-2xl font-medium placeholder-gray-500 outline-none"
                    />
                    <button className="flex items-center space-x-2 bg-gray-600/50 hover:bg-gray-600 px-3 py-2 rounded-lg transition-all">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                      <span className="font-medium">{fromToken.symbol}</span>
                    </button>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={swapTokens}
                    className="cursor-pointer p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/50 transition-all hover:scale-110"
                  >
                    Change
                  </button>
                </div>

                {/* To Token */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-sm">To</span>
                    <span className="text-gray-400 text-sm">
                      Balance: {toToken.balance}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={toAmount}
                      readOnly
                      className="flex-1 bg-transparent text-2xl font-medium placeholder-gray-500 outline-none text-gray-300"
                    />
                    <button className="flex items-center space-x-2 bg-gray-600/50 hover:bg-gray-600 px-3 py-2 rounded-lg transition-all">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                      <span className="font-medium">{toToken.symbol}</span>
                    </button>
                  </div>
                </div>

                {/* Swap Details */}
                {fromAmount && toAmount && (
                  <div className="bg-gray-700/20 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Exchange Rate</span>
                      <span>
                        1 {fromToken.symbol} ={" "}
                        {(
                          parseFloat(toAmount) / parseFloat(fromAmount) || 0
                        ).toFixed(6)}{" "}
                        {toToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price Impact</span>
                      <span className="text-green-400">&lt;0.01%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network Fee</span>
                      <span>~$12.45</span>
                    </div>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={() =>
                    executeSwap({
                      walletAddress,
                      fromAmount,
                      toAmount,
                      fromToken,
                      toToken,
                      setFromToken,
                      setToToken,
                      setFromAmount,
                      setToAmount,
                    })
                  }
                  disabled={!fromAmount || !toAmount}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    fromAmount && toAmount
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      : "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {fromAmount && toAmount ? "Swap Tokens" : "Enter Amount"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="gap-8 mt-2">
          {/* Main Swap Interface */}
          <div className="max-w-fit m-auto">
            <div className="bg-gray-800/50 text-center  backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex text-center items-center mb-6">
                <h2 className="text-2xl font-bold m-auto">Addliquidity</h2>
              </div>

              {/* From Token */}
              <div className="flex gap-4 justify-around mb-3">
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-sm">Token</span>
                    <span className="text-gray-400 text-sm">
                      Balance:{" "}
                      {swapContractBalance.token
                        ? swapContractBalance.token
                        : "Calculating ..."}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={tokenLiquidity}
                      onChange={(e: any) => setTokenLiquidity(e.target.value)}
                      className="flex-1 bg-transparent text-2xl font-medium placeholder-gray-500 outline-none"
                    />
                    <button className="flex items-center space-x-2 bg-gray-600/50 hover:bg-gray-600 px-3 py-2 rounded-lg transition-all">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                      <span className="font-medium">ImuLL</span>
                    </button>
                  </div>
                </div>

                {/* To Token */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-sm">Eth</span>
                    <span className="text-gray-400 text-sm">
                      Balance:{" "}
                      {swapContractBalance.eth
                        ? swapContractBalance.eth
                        : "Calculating ..."}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={ethLiquidity}
                      onChange={(e: any) => setEthLiquidity(e.target.value)}
                      className="flex-1 bg-transparent text-2xl font-medium placeholder-gray-500 outline-none text-gray-300"
                    />
                    <button className="flex items-center space-x-2 bg-gray-600/50 hover:bg-gray-600 px-3 py-2 rounded-lg transition-all">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                      <span className="font-medium">{"ETH"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => addLiquidity(tokenLiquidity, ethLiquidity)}
                  className="cursor-pointer p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/50 transition-all hover:scale-110"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Body;
