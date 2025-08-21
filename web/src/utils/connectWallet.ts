import { BrowserProvider, Contract } from "ethers";
import { weiToEther } from "./ethConverter";
import { ABIS } from "../assets/SwapContractAbi";
import { ERC20_TOKEN } from "./constants";
import type { ConnectWalletParams } from "../interfaces/wallet";

/**
 * Connects the user's wallet via MetaMask, retrieves ETH and ERC20 token balances,
 * and updates the React state using the provided setters.
 */
export async function connectWallet({
  setWalletAddress,
  setFromToken,
  setToToken,
  fromToken,
  toToken,
}: ConnectWalletParams) {
  if (!window.ethereum) {
    console.error("MetaMask not detected!");
    return;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);

    setWalletAddress(address);

    setFromToken({
      ...fromToken,
      balance: Number(weiToEther(balance)).toFixed(3),
    });

    const tokenContract = new Contract(ERC20_TOKEN, ABIS.Contract, provider);
    const tokenBalance = await tokenContract.balanceOf(address);

    setToToken({
      ...toToken,
      balance: Number(weiToEther(tokenBalance)).toFixed(3),
    });

    console.log("Wallet connected:", address);
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}
