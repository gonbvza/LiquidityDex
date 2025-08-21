/**
 * Represents the shape of a token object in state.
 */
export interface TokenState {
  symbol: string;
  name: string;
  balance: string;
}

/**
 * Parameters required by the connectWallet function.
 * Provides state setters and token information.
 */
export interface ConnectWalletParams {
  setWalletAddress: (addr: string) => void;
  setFromToken: React.Dispatch<React.SetStateAction<TokenState>>;
  setToToken: React.Dispatch<React.SetStateAction<TokenState>>;
  fromToken: TokenState;
  toToken: TokenState;
}
