import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "amalon_crm_secret_key_32bytes_!"; // 32 characters
const IV_LENGTH = 16;

export function encryptPassport(text: string): string {
  if (!text) return "";
  try {
    const key = crypto.createHash("sha256").update(String(ENCRYPTION_KEY)).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch {
    return text;
  }
}

export function decryptPassport(text: string): string {
  if (!text) return "";
  if (!text.includes(":")) return text; // If unencrypted or raw
  try {
    const textParts = text.split(":");
    const ivHex = textParts.shift()!;
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const key = crypto.createHash("sha256").update(String(ENCRYPTION_KEY)).digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text;
  }
}
