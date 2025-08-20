import ContractJSON from "../../../out/contract.sol/DEX.json";
import ERC20JSON from "../../../out/ERC20.sol/ERC20.json";
import TestTokenJSON from "../../../out/testToken.sol/TestToken.json";

export const ABIS = {
  Contract: ContractJSON.abi,
  ERC20: ERC20JSON.abi,
  TestToken: TestTokenJSON.abi,
};
