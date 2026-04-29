import * as crypto from "crypto";

const algorithm = "aes-256-gcm";

function getKey() {
  const raw = process.env.APP_ENCRYPTION_KEY || "";
  if (raw.length < 32) return null;
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptText(value: string): string {
  if (!value) return value;
  const iv = crypto.randomBytes(12);
  const key = getKey();
  if (!key) {
    // Fallback to avoid runtime crash when env is missing in serverless.
    return `plain:${Buffer.from(value, "utf8").toString("base64")}`;
  }
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptText(payload: string): string {
  if (!payload) return payload;
  if (payload.startsWith("plain:")) return Buffer.from(payload.slice(6), "base64").toString("utf8");
  const [ivHex, tagHex, dataHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const key = getKey();
  if (!key) throw new Error("Missing APP_ENCRYPTION_KEY for encrypted payload");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  const clear = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return clear.toString("utf8");
}
