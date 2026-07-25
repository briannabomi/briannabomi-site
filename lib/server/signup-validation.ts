import "server-only";

export type Attribution = Partial<
  Record<"source" | "medium" | "campaign" | "content", string>
>;

export type SignupInput = {
  firstName: string;
  email: string;
  website: string;
  startedAt?: number;
  attribution?: Attribution;
};

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const ATTRIBUTION_KEYS = ["source", "medium", "campaign", "content"] as const;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim();
  if (!email || email.length > 254 || !EMAIL_SHAPE.test(email)) return null;
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  return email;
}

export function normalizeFirstName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const firstName = value.trim();
  if (!firstName || firstName.length > 80 || CONTROL_CHARACTERS.test(firstName)) return null;
  return firstName;
}

function cleanAttribution(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100);
  if (!cleaned || cleaned.includes("@")) return undefined;
  return cleaned;
}

export function parseSignupInput(value: unknown):
  | { ok: true; input: SignupInput }
  | { ok: false; reason: "invalid_request" | "invalid_first_name" | "invalid_email" } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, reason: "invalid_request" };
  }
  const body = value as Record<string, unknown>;
  if (Object.keys(body).length > 8) return { ok: false, reason: "invalid_request" };
  const firstName = normalizeFirstName(body.firstName);
  if (!firstName) return { ok: false, reason: "invalid_first_name" };
  const email = normalizeEmail(body.email);
  if (!email) return { ok: false, reason: "invalid_email" };
  if (body.website !== undefined && typeof body.website !== "string") {
    return { ok: false, reason: "invalid_request" };
  }
  if (
    body.startedAt !== undefined &&
    (typeof body.startedAt !== "number" || !Number.isFinite(body.startedAt))
  ) {
    return { ok: false, reason: "invalid_request" };
  }

  let attribution: Attribution | undefined;
  if (body.attribution !== undefined) {
    if (!body.attribution || typeof body.attribution !== "object" || Array.isArray(body.attribution)) {
      return { ok: false, reason: "invalid_request" };
    }
    attribution = {};
    for (const key of ATTRIBUTION_KEYS) {
      const cleaned = cleanAttribution((body.attribution as Record<string, unknown>)[key]);
      if (cleaned) attribution[key] = cleaned;
    }
  }

  return {
    ok: true,
    input: {
      firstName,
      email,
      website: typeof body.website === "string" ? body.website.trim() : "",
      startedAt: body.startedAt as number | undefined,
      attribution,
    },
  };
}
