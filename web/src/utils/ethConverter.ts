import { formatEther } from "ethers";

/**
 * Converts a value from Wei to Ether.
 *
 * @param wei - The amount in Wei as a string or BigNumberish.
 * @returns The equivalent amount in Ether as a string.
 */
export function weiToEther(wei: string | bigint): string {
  return formatEther(wei.toString());
}
