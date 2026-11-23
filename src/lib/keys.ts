import { x25519 } from '@noble/curves/ed25519.js'

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function fromBase64(text: string): Uint8Array | null {
  try {
    const binary = atob(text.trim())
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

/** WireGuard clamps private keys the same way `wg genkey` does. */
function clamp(key: Uint8Array): Uint8Array {
  key[0] &= 248
  key[31] &= 127
  key[31] |= 64
  return key
}

export function generatePrivateKey(): string {
  return toBase64(clamp(randomBytes(32)))
}

export function generatePsk(): string {
  return toBase64(randomBytes(32))
}

export function isValidKey(key: string): boolean {
  const raw = fromBase64(key)
  return !!raw && raw.length === 32
}

export function publicKeyFromPrivate(privateKey: string): string {
  const raw = fromBase64(privateKey)
  if (!raw || raw.length !== 32) return ''
  return toBase64(x25519.getPublicKey(clamp(raw.slice())))
}
