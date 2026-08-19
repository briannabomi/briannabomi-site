import "server-only";

export type Attribution = Partial<
  Record<"source" | "medium" | "campaign" | "content", string>
>;

export const FUNNELS = ["sexbydesign", "intimacyaudit"] as const;
export type Funnel = (typeof FUNNELS)[number];

/* The audit's five archetypes. The client sends only the KEY; the display
   name and descriptor are resolved here, server-side, so a tampered payload
   can never write arbitrary text into the CRM. */
export const ARCHETYPES = {
  P: { name: "The Performer", tag: "Always has the right answer" },
  S: { name: "The Shape Shifter", tag: "Becomes whoever he is with" },
  C: { name: "The Controller", tag: "Runs it like a company" },
  G: { name: "The Ghost", tag: "Present but not in the room" },
  M: { name: "The Compromiser", tag: "Wants less on purpose" },
} as const;
export type ArchetypeKey = keyof typeof ARCHETYPES;

export const LEANS = ["repair", "unsure", "leave", "single"] as const;
export type Lean = (typeof LEANS)[number];

export type AuditProfile = {
  primary: ArchetypeKey;
  secondary?: ArchetypeKey;
  lean?: Lean;
  wantsToBeLed: boolean;
  openToNonMonogamy: boolean;
  kinkCurious: boolean;
};

function isArchetypeKey(value: unknown): value is ArchetypeKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(ARCHETYPES, value);
}

export type SignupInput = {
  firstName: string;
  email: string;
  website: string;
  startedAt?: number;
  attribution?: Attribution;
  funnel?: Funnel;
  audit?: AuditProfile;
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
  if (Object.keys(body).length > 9) return { ok: false, reason: "invalid_request" };
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

  // Which funnel this signup came from. An allow-list, never a raw form id —
  // the client must not be able to choose which Kit form it subscribes to.
  let funnel: Funnel | undefined;
  if (body.funnel !== undefined) {
    if (typeof body.funnel !== "string" || !FUNNELS.includes(body.funnel as Funnel)) {
      return { ok: false, reason: "invalid_request" };
    }
    funnel = body.funnel as Funnel;
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

  /* The audit result. Optional — sexbydesign signups have none, and an audit
     that somehow arrives malformed must never cost us the lead, so a bad
     shape drops the profile rather than rejecting the whole signup. */
  let audit: AuditProfile | undefined;
  if (body.audit && typeof body.audit === "object" && !Array.isArray(body.audit)) {
    const a = body.audit as Record<string, unknown>;
    if (isArchetypeKey(a.primary)) {
      audit = {
        primary: a.primary,
        secondary: isArchetypeKey(a.secondary) ? a.secondary : undefined,
        lean: LEANS.includes(a.lean as Lean) ? (a.lean as Lean) : undefined,
        wantsToBeLed: a.wantsToBeLed === true,
        openToNonMonogamy: a.openToNonMonogamy === true,
        kinkCurious: a.kinkCurious === true,
      };
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
      funnel,
      audit,
    },
  };
}
