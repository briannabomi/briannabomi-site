import { subscribeToAudit } from "@/lib/server/kit";
import { allowSignup } from "@/lib/server/signup-rate-limit";
import { parseSignupInput } from "@/lib/server/signup-validation";

export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 8 * 1024;
const noStore = { "Cache-Control": "no-store" };

type ErrorCode =
  | "invalid_request"
  | "invalid_first_name"
  | "invalid_email"
  | "try_later"
  | "temporarily_unavailable";

const messages: Record<ErrorCode, string> = {
  invalid_request: "We couldn't read that request. Please try again.",
  invalid_first_name: "Enter your first name.",
  invalid_email: "Enter a valid email address, like name@example.com.",
  try_later: "Please wait a moment and try again.",
  temporarily_unavailable: "Email delivery is temporarily unavailable. Please try again later.",
};

function json(body: object, status: number) {
  return Response.json(body, { status, headers: noStore });
}

function document(title: string, message: string, status: number) {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><main><h1>${title}</h1><p>${message}</p><p><a href="/#audit-signup">Return to the signup form</a></p></main></html>`,
    {
      status,
      headers: {
        ...noStore,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function error(code: ErrorCode, requestId: string, status: number, native: boolean) {
  return native
    ? document(
        code === "invalid_email"
          ? "Check your email address"
          : code === "invalid_first_name"
            ? "Check your first name"
            : "Please try again",
        messages[code],
        status,
      )
    : json({ ok: false, code, message: messages[code], requestId }, status);
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
  const requestId = crypto.randomUUID();
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  const native = contentType.startsWith("application/x-www-form-urlencoded");

  if (!sameOrigin(request) || request.headers.get("sec-fetch-site") === "cross-site") {
    return error("invalid_request", requestId, 400, native);
  }
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) return error("invalid_request", requestId, 400, native);
  if (!native && !contentType.startsWith("application/json")) {
    return json(
      {
        ok: false,
        code: "unsupported_media_type",
        message: "Use a supported form submission.",
        requestId,
      },
      415,
    );
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return error("invalid_request", requestId, 400, native);
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return error("invalid_request", requestId, 400, native);
  }

  let body: unknown;
  try {
    if (native) {
      const form = new URLSearchParams(raw);
      const startedAtValue = form.get("startedAt");
      body = {
        firstName: form.get("firstName"),
        email: form.get("email"),
        website: form.get("website") || "",
        startedAt: startedAtValue ? Number(startedAtValue) : undefined,
      };
    } else {
      body = JSON.parse(raw);
    }
  } catch {
    return error("invalid_request", requestId, 400, native);
  }

  const parsed = parseSignupInput(body);
  if (!parsed.ok) {
    return error(
      parsed.reason,
      requestId,
      parsed.reason === "invalid_email" || parsed.reason === "invalid_first_name" ? 422 : 400,
      native,
    );
  }

  // A filled honeypot receives an accepted-looking response, but never calls Kit.
  if (parsed.input.website) {
    return native
      ? document("Check your inbox", "If this address is eligible, look for a confirmation message.", 200)
      : json({ ok: true, status: "accepted", requestId }, 202);
  }

  const elapsed =
    typeof parsed.input.startedAt === "number" ? Date.now() - parsed.input.startedAt : undefined;
  const timingSuspicious = elapsed !== undefined && elapsed >= 0 && elapsed < 350;
  const limit = await allowSignup({
    email: parsed.input.email,
    networkHint:
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim(),
    timingSuspicious,
  });
  if (limit === "unavailable") {
    return error("temporarily_unavailable", requestId, 503, native);
  }
  if (limit === "rate_limited") return error("try_later", requestId, 429, native);

  const result = await subscribeToAudit({
    firstName: parsed.input.firstName,
    email: parsed.input.email,
    requestId,
  });
  if (result.status === "accepted") {
    return native
      ? document(
          "Check your inbox",
          "If this address is eligible, look for a confirmation message. After you confirm, we'll send the audit.",
          200,
        )
      : json({ ok: true, status: "accepted", requestId }, 202);
  }
  if (result.status === "preview_only") {
    return native
      ? document("Preview submission tested", "No email was sent because delivery is not connected in this preview.", 200)
      : json({ ok: true, status: "preview_only", requestId }, 200);
  }
  return error(
    "temporarily_unavailable",
    requestId,
    result.status === "timed_out" ? 504 : 503,
    native,
  );
}
