import "server-only";

/**
 * The Intimacy Audit — personalised read.
 *
 * Holds ANTHROPIC_API_KEY server-side and builds the prompt here, so the
 * browser sends facts (`archetype: "C"`, `unsaid: "wanted"`) rather than
 * instructions. Every field is checked against an allow-list, which keeps
 * this route from being repurposed as an open Claude endpoint.
 *
 * Env:
 *   ANTHROPIC_API_KEY   required — without it the audit serves its offline read
 *   AUDIT_READ_MODEL    optional — defaults to claude-sonnet-4-6
 *   COACH_NAME          optional — defaults to Brianna
 *
 * The client treats any non-2xx as "use the fallback", so a failure here
 * degrades to a written read rather than an error screen.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_BODY_BYTES = 4 * 1024;
const noStore = { "Cache-Control": "no-store" };

type Key = "P" | "S" | "C" | "G" | "M";

const PATTERNS: Record<Key, { name: string; tag: string; line: string }> = {
  P: { name: "The Performer", tag: "Always has the right answer",
       line: "You know the correct answer better than the one stuck in your throat." },
  S: { name: "The Shape Shifter", tag: "Becomes whoever he is with",
       line: "You've gotten so good at taking the shape of whoever you're with that you've lost your own." },
  C: { name: "The Controller", tag: "Runs it like a company",
       line: "You've mastered giving. Receiving is another story." },
  G: { name: "The Ghost", tag: "Present but not in the room",
       line: "You're not always in the room, even when you're in the room." },
  M: { name: "The Compromiser", tag: "Wants less on purpose",
       line: "You know what you want. You've already talked yourself out of it." },
};

const UNSAID: Record<string, string> = {
  control: "wants to stop being the one in charge",
  more: "wants more sex than he has admitted",
  specific: "wants something specific he assumes would be judged",
  others: "wants freedom to want other people",
  wanted: "wants to be wanted rather than merely accepted",
  gone: "wants to say the attraction is gone",
  dontknow: "doesn't know yet, and names that as the problem",
};

const ALLOW = {
  blocks: ["desire", "resentment", "avoidance", "incompat", "truth"],
  lean: ["repair", "unsure", "leave", "single"],
  structure: ["Monogamous", "Open", "Polyamorous", "Swinging", "Unsure"],
  power: ["Lead", "Led", "Switch", "Service", "Traditional", "UnsureP"],
  explore: ["Slow", "Restraint", "Intensity", "Watched", "Group", "Ritual", "Aftercare"],
  unsaid: Object.keys(UNSAID),
} as const;

const isKey = (v: unknown): v is Key =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(PATTERNS, v);

const pick = (value: unknown, allowed: readonly string[]): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && allowed.includes(v))
        .slice(0, allowed.length)
    : [];

const cleanName = (value: unknown): string =>
  String(value ?? "")
    .replace(/[^\p{L}\p{M}'\-. ]/gu, "")
    .trim()
    .slice(0, 40) || "there";

type Profile = {
  name: string;
  archetype: Key;
  secondary: Key | "";
  blocks: string[];
  lean: string;
  structure: string[];
  power: string[];
  explore: string[];
  unsaid: string;
};

function buildPrompt(p: Profile): string {
  const coach = process.env.COACH_NAME || "Brianna";
  const primary = PATTERNS[p.archetype];
  const secondary = p.secondary ? PATTERNS[p.secondary] : null;
  const unsaid = UNSAID[p.unsaid] || "not answered";
  const list = (a: string[]) => (a.length ? a.join(", ") : "not answered");

  return `You are ${coach}, a sex and relationship coach. Your method: nobody can accurately test whether a relationship can hold their desire until they have fully owned that desire themselves.

READER PROFILE: a senior professional man — founder, executive, or similar. Competent, time-poor, used to solving problems by applying more effort. Unaccustomed to being the one who doesn't know. Speak to him as a peer, not a patient.

VOICE: direct, warm, unsentimental, adult. No hype, no therapy-speak, no exclamation marks. Never use "journey", "empowered", "sacred", "hold space", "beautiful", or "vulnerable" as a noun. Sentence case.

HARD RULES
- Never generate sexual or explicit content. You write about patterns, fear and honesty. Reference anything he selected only as a fact, never descriptively.
- Never tell him to leave or stay. You don't have enough information, and saying so is part of the read.
- Don't diagnose. If the answers point to trauma or dissociation, name it as deserving proper support, not something to push through.
- Don't restate the archetype description; it's already on the page.

DATA
Name: ${p.name}
Archetype: ${primary.name} — ${primary.tag}. ${primary.line}
${secondary ? `Secondary: ${secondary.name}` : "No clear secondary."}
Stuck at: ${list(p.blocks)}
Says relationship can hold it: ${p.lean || "not answered"}
Structure that pulls: ${list(p.structure)}
Power that pulls: ${list(p.power)}
Curious about: ${list(p.explore)}
The thing he has never said: ${unsaid}

Return ONLY valid JSON, no fences:
{
 "letter":"140-180 words to ${p.name} by name, second person, a short private letter. Anchor it in the specific thing he has never said, and connect that to his archetype. Don't comfort or flatter him — he'll distrust it. End on what becomes available once the want is owned. Use \\n\\n between paragraphs.",
 "costing":"Two sentences on what this pattern is costing HIM specifically, given his selections. Concrete, not abstract.",
 "read":"3-4 sentences on whether this reads as repair or genuine mismatch, given his answer of '${p.lean || "not answered"}'. Be honest that a form can't settle it. Name the evidence that would: whether he has ever put the want to his partner undiluted. Make clear both answers are workable.",
 "sentence":"One sentence he could actually say to his partner to open this. His register — plain, adult, no softening, no exit ramp. Under 30 words."
}`;
}

function fail(code: string, status: number) {
  return Response.json({ ok: false, code }, { status, headers: noStore });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = process.env.PUBLIC_SITE_URL;
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(configured || request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request) || request.headers.get("sec-fetch-site") === "cross-site") {
    return fail("invalid_request", 400);
  }
  if (!process.env.ANTHROPIC_API_KEY) return fail("not_configured", 503);

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail("invalid_request", 400);
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return fail("invalid_request", 400);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("invalid_request", 400);
  }

  const profile: Profile = {
    name: cleanName(body.name),
    archetype: isKey(body.archetype) ? body.archetype : "P",
    secondary: isKey(body.secondary) ? body.secondary : "",
    blocks: pick(body.blocks, ALLOW.blocks),
    lean: typeof body.lean === "string" && (ALLOW.lean as readonly string[]).includes(body.lean)
      ? body.lean : "",
    structure: pick(body.structure, ALLOW.structure),
    power: pick(body.power, ALLOW.power),
    explore: pick(body.explore, ALLOW.explore),
    unsaid: typeof body.unsaid === "string" && ALLOW.unsaid.includes(body.unsaid)
      ? body.unsaid : "",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22_000);
  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: process.env.AUDIT_READ_MODEL || DEFAULT_MODEL,
        max_tokens: 1200,
        temperature: 1,
        messages: [{ role: "user", content: buildPrompt(profile) }],
      }),
    });
  } catch {
    return fail("upstream_unreachable", 504);
  } finally {
    clearTimeout(timeout);
  }

  if (!upstream.ok) return fail("upstream", 502);

  const data = (await upstream.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("")
    .replace(/```json|```/g, "")
    .trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return fail("unparseable", 502);

  let out: Record<string, unknown>;
  try {
    out = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return fail("unparseable", 502);
  }

  for (const field of ["letter", "costing", "read", "sentence"]) {
    if (typeof out[field] !== "string" || !(out[field] as string).trim()) {
      return fail("incomplete", 502);
    }
  }

  return Response.json(
    {
      letter: out.letter,
      costing: out.costing,
      read: out.read,
      sentence: out.sentence,
    },
    { headers: noStore },
  );
}
