"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Props = {
  id: string;
  location?: "hero" | "final";
  heading?: string;
  intro?: string;
  description?: string;
};

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "accepted" | "preview_only" }
  | {
      status: "error";
      message: string;
      kind: "validation" | "transient";
      invalidField?: "firstName" | "email";
    };

export function AuditSignupForm({ id, heading, intro, description }: Props) {
  const [state, setState] = useState<State>({ status: "idle" });
  const [startedAt] = useState(() => Date.now());
  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const statusHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const pending = state.status === "submitting";
  const complete = state.status === "accepted" || state.status === "preview_only";
  const firstNameId = `${id}-first-name`;
  const inputId = `${id}-email`;
  const errorId = `${id}-error`;

  useEffect(() => {
    if (state.status === "accepted" || state.status === "preview_only") {
      statusHeadingRef.current?.focus();
    }
  }, [state.status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setState({ status: "submitting" });

    const params = new URLSearchParams(window.location.search);
    const attribution = Object.fromEntries(
      ["source", "medium", "campaign", "content"]
        .map((key) => [key, params.get(`utm_${key}`)])
        .filter((entry): entry is [string, string] => Boolean(entry[1])),
    );
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch("/api/audit-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          firstName: data.get("firstName"),
          website: data.get("website"),
          startedAt,
          attribution,
        }),
        signal: controller.signal,
      });
      const result = (await response.json()) as {
        ok: boolean;
        status?: "accepted" | "preview_only";
        code?: "invalid_first_name" | "invalid_email";
        message?: string;
      };
      if (response.ok && result.ok && result.status === "accepted") {
        form.reset();
        setState({ status: "accepted" });
        return;
      }
      if (response.ok && result.ok && result.status === "preview_only") {
        form.reset();
        setState({ status: "preview_only" });
        return;
      }
      const invalidField =
        result.code === "invalid_first_name"
          ? "firstName"
          : result.code === "invalid_email"
            ? "email"
            : undefined;
      setState({
        status: "error",
        message: result.message || "Something went wrong. Please try again.",
        kind: response.status === 422 ? "validation" : "transient",
        invalidField,
      });
      window.setTimeout(
        () =>
          (invalidField === "firstName"
            ? firstNameRef.current
            : invalidField === "email"
              ? emailRef.current
              : errorRef.current
          )?.focus(),
        0,
      );
    } catch {
      setState({
        status: "error",
        message: "We couldn't connect. Check your connection and try again.",
        kind: "transient",
      });
      window.setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return (
    <section
      id={id}
      className="audit-signup"
      aria-labelledby={heading ? `${id}-heading` : undefined}
      aria-label={heading ? undefined : "Request The Intimacy Audit"}
    >
      {heading && <h2 id={`${id}-heading`}>{heading}</h2>}
      {(intro || description) && <p>{intro || description}</p>}
      {complete ? (
        <div className="audit-signup__status" role="status" aria-live="polite">
          {state.status === "accepted" ? (
            <>
              <h2 ref={statusHeadingRef} tabIndex={-1}>
                Check your inbox
              </h2>
              <p>
                If this address is eligible, look for a confirmation message. After you confirm,
                we&apos;ll send the audit. Delivery can take a few minutes; check spam or promotions
                if needed.
              </p>
            </>
          ) : (
            <>
              <h2 ref={statusHeadingRef} tabIndex={-1}>
                Preview submission tested
              </h2>
              <p>No email was sent because delivery is not connected in this preview.</p>
            </>
          )}
        </div>
      ) : (
        <form
          className="audit-signup__form"
          method="post"
          action="/api/audit-signup"
          onSubmit={submit}
          aria-busy={pending}
        >
          <div className="audit-signup__controls">
            <div className="audit-signup__field">
              <label htmlFor={firstNameId}>First name</label>
              <input
                ref={firstNameRef}
                id={firstNameId}
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                maxLength={80}
                aria-describedby={
                  state.status === "error" && state.invalidField === "firstName"
                    ? errorId
                    : undefined
                }
                aria-invalid={
                  state.status === "error" && state.invalidField === "firstName"
                    ? true
                    : undefined
                }
              />
            </div>
            <div className="audit-signup__field">
              <label htmlFor={inputId}>Email address</label>
              <input
                ref={emailRef}
                id={inputId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="name@example.com"
                required
                maxLength={254}
                aria-describedby={
                  state.status === "error" && state.invalidField === "email" ? errorId : undefined
                }
                aria-invalid={
                  state.status === "error" && state.invalidField === "email" ? true : undefined
                }
              />
            </div>
            <button type="submit" disabled={pending}>
              {pending ? "Sending your request…" : "Get the Intimacy Audit"}
            </button>
          </div>
          <input type="hidden" name="startedAt" value={startedAt} />
          <div className="audit-signup__honeypot" aria-hidden="true">
            <label htmlFor={`${id}-website`}>Website</label>
            <input id={`${id}-website`} name="website" type="text" autoComplete="off" tabIndex={-1} />
          </div>
          {state.status === "error" && (
            <p
              ref={errorRef}
              id={errorId}
              className="audit-signup__error"
              role="alert"
              tabIndex={-1}
            >
              {state.message}
            </p>
          )}
          {pending && (
            <p className="audit-signup__status" role="status" aria-live="polite">
              Submitting your request.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
