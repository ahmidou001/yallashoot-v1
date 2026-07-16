import crypto from "crypto";

const STREAM_SECRET_KEY = process.env.STREAM_SECRET_KEY || "fallback_secret_key_123456";

/**
 * Generates a signed playback token for a given game ID that is valid for a limited time.
 * @param gameId The game ID being streamed
 * @param validityMs Token validity duration in milliseconds (default 4 hours)
 */
export function generateStreamToken(gameId: string, validityMs = 4 * 60 * 60 * 1000): { token: string; expires: number } {
  const expires = Date.now() + validityMs;
  const data = `${gameId}:${expires}`;
  
  const token = crypto
    .createHmac("sha256", STREAM_SECRET_KEY)
    .update(data)
    .digest("hex");
    
  return { token, expires };
}

/**
 * Verifies if a given stream token is valid for the game ID and has not expired.
 * @param gameId The game ID being requested
 * @param token The HMAC signature token
 * @param expires The expiration timestamp
 */
export function verifyStreamToken(gameId: string, token: string, expires: number): boolean {
  // Check if expired
  if (Date.now() > expires) {
    return false;
  }
  
  const data = `${gameId}:${expires}`;
  const expectedToken = crypto
    .createHmac("sha256", STREAM_SECRET_KEY)
    .update(data)
    .digest("hex");
    
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expectedToken, "hex"));
  } catch {
    return false;
  }
}

/**
 * Generates a secure link for Nginx secure_link module.
 * Matches Nginx secure_link_md5 "$secure_link_expires$uri$http_user_agent$STREAM_SECRET_KEY";
 * @param url The target stream URL
 * @param secret The stream secret key
 * @param userAgent The client browser's User-Agent header
 * @param expiresInSeconds Validity in seconds (default: 6 hours)
 */
export function signSecureStreamUrl(
  url: string,
  secret: string,
  userAgent: string,
  expiresInSeconds: number = 21600
): string {
  if (!url) return url;
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Calculate expiration timestamp
    const expires = Math.ceil(Date.now() / 1000) + expiresInSeconds;

    // The string to hash: expires + path + userAgent + secret
    const stringToHash = `${expires}${path}${userAgent}${secret}`;

    // Generate MD5 hash
    const md5Hash = crypto
      .createHash("md5")
      .update(stringToHash)
      .digest("base64");

    // Nginx standard base64 URL safe replacement
    const urlSafeHash = md5Hash
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    // Set query params
    urlObj.searchParams.set("md5", urlSafeHash);
    urlObj.searchParams.set("expires", expires.toString());

    return urlObj.toString();
  } catch (error) {
    console.error("Error signing URL:", error);
    return url;
  }
}
