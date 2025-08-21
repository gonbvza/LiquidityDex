import type { AddressLike } from "ethers";
import type { TokenState } from "./wallet";

/**
 * Parameters required by the executeSwap function.
 * Provides state setters and token information.
 */
export interface ExecuteSwapParams {
  walletAddress: AddressLike;
  fromAmount: string;
  toAmount: string;
  fromToken: any;
  toToken: any;
  setFromToken: React.Dispatch<React.SetStateAction<TokenState>>;
  setToToken: React.Dispatch<React.SetStateAction<TokenState>>;
  setFromAmount: (addr: string) => void;
  setToAmount: (addr: string) => void;
}
