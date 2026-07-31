import crypto from "crypto";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.yallahsoot.com";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "c7a84e912b3446fa9817e08920bc8b20";

/**
 * Generate Google OAuth2 Access Token from Service Account Key via Node.js native crypto
 */
async function getGoogleAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.log("[Google Indexing API] Skipped: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY not set in env.");
    return null;
  }

  // Handle escaped line breaks in private key string
  privateKey = privateKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(claimSet)).toString("base64url");
  const signatureInput = `${base64Header}.${base64Payload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  const signature = signer.sign(privateKey, "base64url");
  const jwt = `${signatureInput}.${signature}`;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Google Indexing API] Token exchange error:", errText);
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error("[Google Indexing API] Fetch token failed:", err);
    return null;
  }
}

/**
 * Notify Google Indexing API to instantly crawl and index a URL
 */
export async function notifyGoogleIndexing(url: string, type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"): Promise<boolean> {
  try {
    const token = await getGoogleAccessToken();
    if (!token) return false;

    const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (res.ok) {
      console.log(`[Google Indexing API] Successfully notified Google for URL: ${url}`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[Google Indexing API] Publish error for ${url}:`, errText);
      return false;
    }
  } catch (err) {
    console.error("[Google Indexing API] Exception:", err);
    return false;
  }
}

/**
 * Notify IndexNow API (Bing, Yandex, Seznam) to instantly crawl URLs
 */
export async function notifyIndexNow(urls: string | string[]): Promise<boolean> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  const host = new URL(SITE_URL).hostname;

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 202) {
      console.log(`[IndexNow Bing API] Successfully notified Bing/Yandex for ${urlList.length} URLs.`);
      return true;
    } else {
      const errText = await res.text();
      console.error("[IndexNow Bing API] Error response:", errText);
      return false;
    }
  } catch (err) {
    console.error("[IndexNow Bing API] Exception:", err);
    return false;
  }
}

/**
 * Notify all Search Engines (Google & Bing) for instant auto-indexing
 */
export async function notifyAllSearchEngines(url: string): Promise<{ google: boolean; indexNow: boolean }> {
  const [googleResult, indexNowResult] = await Promise.all([
    notifyGoogleIndexing(url),
    notifyIndexNow(url),
  ]);

  return { google: googleResult, indexNow: indexNowResult };
}
