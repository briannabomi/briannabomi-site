"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: `#${string}`;
};

export function AuditAnchorLink({ href, onClick, ...props }: Props) {
  function activate(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(href);
      const focusTarget =
        target?.querySelector<HTMLElement>(
          'input[type="email"]:not(:disabled), h2, [tabindex="-1"]',
        ) ?? target;

      if (!focusTarget) return;
      if (!focusTarget.hasAttribute("tabindex") && focusTarget.tagName !== "INPUT") {
        focusTarget.setAttribute("tabindex", "-1");
      }
      focusTarget.focus({ preventScroll: true });
    });
  }

  return <a href={href} onClick={activate} {...props} />;
}
