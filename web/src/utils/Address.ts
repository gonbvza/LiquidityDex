/**
 * Shortens an address by keeping the first and last 4 characters.
 */
export function addressShortener(address: string): string {
  return address.slice(0, 7) + "..." + address.slice(-5);
}
