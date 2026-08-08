const KIT_FORM_ID = "9779798";
const KIT_FORM_UID = "db420c1dd8";
const KIT_FORM_OPTIONS = JSON.stringify({
  settings: {
    after_subscribe: {
      action: "message",
      success_message: "Success! Now check your email to confirm your subscription.",
      redirect_url: "",
    },
    recaptcha: { enabled: false },
    powered_by: { show: false },
    return_visitor: { action: "show", custom_content: "" },
  },
  version: "5",
});

type Props = {
  id: string;
  location?: "hero" | "final";
  heading?: string;
  intro?: string;
  description?: string;
};

export function AuditSignupForm({ id, heading, intro, description }: Props) {
  const firstNameId = `${id}-first-name`;
  const emailId = `${id}-email`;

  return (
    <section
      id={id}
      className="audit-signup"
      aria-labelledby={heading ? `${id}-heading` : undefined}
      aria-label={heading ? undefined : "Request The Intimacy Audit"}
    >
      {heading && <h2 id={`${id}-heading`}>{heading}</h2>}
      {(intro || description) && <p>{intro || description}</p>}
      <form
        className="seva-form formkit-form audit-signup__form"
        action={`https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`}
        method="post"
        data-sv-form={KIT_FORM_ID}
        data-uid={KIT_FORM_UID}
        data-format="inline"
        data-version="5"
        data-options={KIT_FORM_OPTIONS}
      >
        <ul className="formkit-alert formkit-alert-error" data-element="errors" data-group="alert" />
        <div className="audit-signup__controls formkit-fields" data-element="fields">
          <div className="audit-signup__field formkit-field">
            <label htmlFor={firstNameId}>First name</label>
            <input
              className="formkit-input"
              id={firstNameId}
              name="fields[first_name]"
              type="text"
              autoComplete="given-name"
              required
              maxLength={80}
            />
          </div>
          <div className="audit-signup__field formkit-field">
            <label htmlFor={emailId}>Email address</label>
            <input
              className="formkit-input"
              id={emailId}
              name="email_address"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="name@example.com"
              required
              maxLength={254}
            />
          </div>
          <button className="formkit-submit" type="submit" data-element="submit">
            <span>Get the Intimacy Audit</span>
          </button>
        </div>
      </form>
    </section>
  );
}
