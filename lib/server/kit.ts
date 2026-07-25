import "server-only";

export type SignupMode = "live" | "placeholder" | "disabled";
export type SubscribeResult =
  | { status: "accepted" }
  | { status: "preview_only" }
  | { status: "disabled" | "unavailable" | "timed_out" };

type Transport = typeof fetch;

function mode(): SignupMode {
  const configured = process.env.SIGNUP_MODE;
  return configured === "live" || configured === "placeholder" || configured === "disabled"
    ? configured
    : "disabled";
}

async function requestKit(
  path: string,
  init: RequestInit,
  transport: Transport,
  deadline: number,
): Promise<Response> {
  let lastResponse: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new DOMException("Provider deadline exceeded", "TimeoutError");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(3_500, remaining));
    try {
      const response = await transport(path, { ...init, signal: controller.signal });
      lastResponse = response;
      if (response.ok || ![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
        return response;
      }
      const retryAfterSeconds = Number(response.headers.get("retry-after"));
      const retryDelay =
        response.status === 429 && Number.isFinite(retryAfterSeconds)
          ? Math.min(retryAfterSeconds * 1_000, 1_500)
          : 150 * 2 ** attempt + Math.random() * 100;
      if (Date.now() + retryDelay >= deadline) return response;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } catch (error) {
      if (attempt === 2 || Date.now() + 250 >= deadline) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, 150 * 2 ** attempt + Math.random() * 100),
      );
    } finally {
      clearTimeout(timeout);
    }
  }
  return lastResponse!;
}

export async function subscribeToAudit(
  input: { firstName: string; email: string; requestId: string },
  transport: Transport = fetch,
): Promise<SubscribeResult> {
  const signupMode = mode();
  if (signupMode === "disabled") return { status: "disabled" };
  if (signupMode === "placeholder") {
    return process.env.NODE_ENV === "production"
      ? { status: "disabled" }
      : { status: "preview_only" };
  }

  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!apiKey || !formId) return { status: "unavailable" };

  const base = (process.env.KIT_API_BASE_URL || "https://api.kit.com/v4").replace(/\/+$/, "");
  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": apiKey,
  };
  const deadline = Date.now() + 8_000;

  try {
    const subscriberResponse = await requestKit(
      `${base}/subscribers`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ email_address: input.email, first_name: input.firstName }),
      },
      transport,
      deadline,
    );
    if (!subscriberResponse.ok) return { status: "unavailable" };
    const payload = (await subscriberResponse.json()) as {
      id?: number | string;
      subscriber?: { id?: number | string };
    };
    const subscriberId = payload.subscriber?.id ?? payload.id;
    if (subscriberId === undefined || subscriberId === null) return { status: "unavailable" };

    const associationResponse = await requestKit(
      `${base}/forms/${encodeURIComponent(formId)}/subscribers/${encodeURIComponent(String(subscriberId))}`,
      { method: "POST", headers, body: "{}" },
      transport,
      deadline,
    );
    return associationResponse.ok ? { status: "accepted" } : { status: "unavailable" };
  } catch (error) {
    if (
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof DOMException && error.name === "TimeoutError")
    ) {
      return { status: "timed_out" };
    }
    return { status: "unavailable" };
  }
}
