import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function deriveKey(): Buffer | null {
  const raw = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  try {
    const asBase64 = Buffer.from(trimmed, "base64");
    if (asBase64.length === 32) return asBase64;
  } catch {
    // ignore and fall through
  }

  return createHash("sha256").update(trimmed).digest();
}

export function encryptSocialToken(token: string | null | undefined): { value: string | null; encrypted: boolean } {
  if (!token) return { value: null, encrypted: false };

  const key = deriveKey();
  if (!key) {
    return { value: token, encrypted: false };
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const packed = Buffer.concat([iv, tag, encrypted]).toString("base64");

  return { value: packed, encrypted: true };
}

export function decryptSocialToken(value: string | null | undefined, encrypted: boolean | null | undefined): string | null {
  if (!value) return null;
  if (!encrypted) return value;

  const key = deriveKey();
  if (!key) return null;

  const data = Buffer.from(value, "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");

  return plaintext;
}
