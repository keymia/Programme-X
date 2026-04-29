import * as crypto from "crypto";

const algorithm = "aes-256-gcm";

function getKey() {
  const raw = process.env.APP_ENCRYPTION_KEY || "";
  if (raw.length < 32) throw new Error("APP_ENCRYPTION_KEY must be at least 32 characters");
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptText(value: string): string {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptText(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const key = getKey();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  const clear = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return clear.toString("utf8");
}

