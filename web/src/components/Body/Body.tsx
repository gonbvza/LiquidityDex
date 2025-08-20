import React, { useEffect, useState } from "react";
import { addressShortener } from "../../utils/Address";
import {
  formatEther,
  parseUnits,
  JsonRpcProvider,
  parseEther,
  Contract,
  BrowserProvider,
} from "ethers";
import { weiToEther } from "../../utils/ethConverter";
import { ABIS } from "../../assets/SwapContractAbi";

const RPC_URL = import.meta.env.VITE_RPC_URL;
const SWAP_CONTRACT = "0x920977dc3862cf8549425728Cc56b36c5a012f39";
const ERC20_TOKEN = "0xf0dcFeA06962313d2963d7Ff9CA49b43B3dAa62b";
console.log("RPC URL:", RPC_URL);

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
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [walletAddress, setwalletAddress] = useState("");
  const [swapRatio, setSwapRatio] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const provider = new JsonRpcProvider(RPC_URL);
        const tokenContract = new Contract(ERC20_TOKEN, ABIS.ERC20, provider);
        let eth_balance = formatEther(await provider.getBalance(SWAP_CONTRACT));
        let unparsedTokenBalance = await tokenContract.balanceOf(SWAP_CONTRACT);
        let token_balance = formatEther(unparsedTokenBalance.toString());

        setSwapContractBalance({
          token: token_balance.toString(),
          eth: eth_balance,
        });

        console.log("Ethereum balance is ", eth_balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);
  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  async function connectWallet() {
    if (!window.ethereum) {
      console.error("MetaMask not detected!");
      return;
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);

    setwalletAddress(address);
    setFromToken({
      ...fromToken,
      balance: Number(weiToEther(balance)).toFixed(3),
    });
    console.log("Connected wallet:", address);
    const contract = new Contract(ERC20_TOKEN, ABIS.Contract, provider);

    let tokenBalance = await contract.balanceOf(address);
    setToToken({
      ...toToken,
      balance: Number(weiToEther(tokenBalance)).toFixed(3),
    });

    const dexContract = new Contract(SWAP_CONTRACT, ABIS.Contract, provider);

    setSwapRatio(Number(await dexContract.getRatio()).toString());
  }

  function handleTokenInput(_amount: number) {
    setTokenLiquidity(_amount);
  }

  function handleEthInput(_amount: number) {
    setEthLiquidity(_amount);
  }

  async function addLiquidity() {
    if (!tokenLiquidity || tokenLiquidity === undefined) {
      throw new Error("liquidity is missing");
    }

    const provider = new BrowserProvider(window.ethereum);
    const tokenContract = new Contract(ERC20_TOKEN, ABIS.ERC20, provider);
    const signer = await provider.getSigner();
    const tokenWithSigner = tokenContract.connect(signer);
    const amount = parseUnits(tokenLiquidity.toString(), 18);
    await tokenWithSigner.approve(SWAP_CONTRACT, amount);

    const swapContract = new Contract(SWAP_CONTRACT, ABIS.Contract, provider);
    const swapWithSigner = swapContract.connect(signer);
    const tx = await swapWithSigner.addLiquidity(amount, {
      value: parseEther(ethLiquidity.toString()),
    });

    await tx.wait();
  }

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
              onClick={() => connectWallet()}
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
                    className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/50 transition-all hover:scale-110"
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
                      onChange={(e: any) => handleTokenInput(e.target.value)}
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
                      onChange={(e: any) => handleEthInput(e.target.value)}
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
                  onClick={addLiquidity}
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
