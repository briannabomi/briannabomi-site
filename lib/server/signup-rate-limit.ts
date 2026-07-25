import "server-only";

type Entry = { count: number; resetsAt: number };

const buckets = new Map<string, Entry>();
const WINDOW_MS = 60_000;
let ephemeralDevelopmentSecret: string | undefined;

function developmentSecret() {
  ephemeralDevelopmentSecret ??= crypto.randomUUID();
  return ephemeralDevelopmentSecret;
}

async function digest(value: string, secret: string) {
  const bytes = new TextEncoder().encode(`${secret}:${value}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

function consume(key: string, limit: number, now: number) {
  const current = buckets.get(key);
  if (!current || current.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + WINDOW_MS });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

export async function allowSignup(input: {
  email: string;
  networkHint?: string;
  timingSuspicious?: boolean;
}): Promise<"allowed" | "rate_limited" | "unavailable"> {
  // A stable production secret prevents raw email and network identifiers from
  // being retained in the bounded, process-local buckets. Each Vercel instance
  // enforces the same limits independently; a shared store can replace this
  // adapter later without changing the route contract.
  const configuredSecret = process.env.SIGNUP_HASH_SECRET;
  if (process.env.NODE_ENV === "production" && !configuredSecret) {
    return "unavailable";
  }
  const secret = configuredSecret || developmentSecret();
  const now = Date.now();
  // Keep this fallback bounded. A platform rate-limit binding can replace it without
  // changing the route contract.
  if (buckets.size > 2_000) {
    for (const [key, entry] of buckets) {
      if (entry.resetsAt <= now) buckets.delete(key);
    }
    if (buckets.size > 2_000) return "unavailable";
  }
  const emailKey = `email:${await digest(input.email, secret)}`;
  // Do not put unrelated clients in one shared "unknown" network bucket.
  const networkAllowed = input.networkHint
    ? consume(`network:${await digest(input.networkHint, secret)}`, 8, now)
    : true;
  const emailCost = input.timingSuspicious ? 2 : 1;
  let emailAllowed = true;
  for (let index = 0; index < emailCost; index += 1) {
    emailAllowed = consume(emailKey, 4, now) && emailAllowed;
  }
  return networkAllowed && emailAllowed ? "allowed" : "rate_limited";
}
