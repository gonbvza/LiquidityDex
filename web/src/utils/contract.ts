import type { AddressLike } from "ethers";
import { BrowserProvider, parseEther, Contract, parseUnits } from "ethers";
import { ERC20_TOKEN, SWAP_CONTRACT } from "./constants";
import { ABIS } from "../assets/SwapContractAbi";
import type { ExecuteSwapParams } from "../interfaces/swap";
import { weiToEther } from "./ethConverter";

/**
 * Executes a token/ETH swap using the connected wallet.
 * Handles approvals, transaction execution, and state updates.
 */
export const executeSwap = async ({
  walletAddress,
  fromAmount,
  toAmount,
  fromToken,
  toToken,
  setFromToken,
  setToToken,
  setFromAmount,
  setToAmount,
}: ExecuteSwapParams): Promise<void> => {
  if (!walletAddress || !fromAmount || !toAmount) {
    console.error("Missing required data for swap");
    return;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const swapContract = new Contract(SWAP_CONTRACT, ABIS.Contract, provider);
    const swapWithSigner = swapContract.connect(signer);

    const amount = parseEther(fromAmount);
    let tx;

    if (fromToken.symbol === "ETH") {
      tx = await swapWithSigner.swapEthToToken({ value: amount });
    } else {
      const tokenContract = new Contract(ERC20_TOKEN, ABIS.ERC20, provider);
      const tokenWithSigner = tokenContract.connect(signer);

      await tokenWithSigner.approve(SWAP_CONTRACT, amount);
      tx = await swapWithSigner.swapTokenToEth(amount);
    }

    await tx.wait();

    const balance = await provider.getBalance(walletAddress);
    const tokenContract = new Contract(ERC20_TOKEN, ABIS.Contract, provider);
    const tokenBalance = await tokenContract.balanceOf(walletAddress);

    setFromToken({
      ...fromToken,
      balance: Number(weiToEther(balance)).toFixed(3),
    });

    setToToken({
      ...toToken,
      balance: Number(weiToEther(tokenBalance)).toFixed(3),
    });

    setFromAmount("");
    setToAmount("");
  } catch (error) {
    console.error("Swap failed:", error);
  }
};

/**
 * Adds liquidity to the DEX by supplying both token and ETH amounts.
 * Approves the contract to spend tokens before adding liquidity.
 */
export const addLiquidity = async (
  tokenLiquidity: number,
  ethLiquidity: number,
): Promise<void> => {
  if (!tokenLiquidity) {
    throw new Error("Token liquidity is missing");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const tokenContract = new Contract(ERC20_TOKEN, ABIS.ERC20, provider);
  const tokenWithSigner = tokenContract.connect(signer);

  const tokenAmount = parseUnits(tokenLiquidity.toString(), 18);
  await tokenWithSigner.approve(SWAP_CONTRACT, tokenAmount);

  const swapContract = new Contract(SWAP_CONTRACT, ABIS.Contract, provider);
  const swapWithSigner = swapContract.connect(signer);

  const tx = await swapWithSigner.addLiquidity(tokenAmount, {
    value: parseEther(ethLiquidity.toString()),
  });

  await tx.wait();
};
