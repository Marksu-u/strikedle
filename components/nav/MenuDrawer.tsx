"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import DailyPanel from "./DailyPanel";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MenuDrawer() {
  const nav = useTranslations("nav");
  const menu = useTranslations("menu");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
    const restore = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      // Keep Tab inside the drawer: it covers the page, so a focus ring landing
      // on the board behind it would be invisible.
      if (event.key !== "Tab" || !drawerRef.current) return;
      const stops = drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = restore;
    };
  }, [open]);

  // Focus goes back where it came from, so closing does not dump the keyboard
  // user at the top of the document.
  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={nav("menu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-md border border-[color:var(--border)] bg-[var(--surface)] p-2.5 text-[color:var(--muted)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Portalled to <body>: the header above this button carries a
          backdrop-blur, which makes it the containing block for `fixed`
          descendants — inside it the overlay is the height of the bar. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <div
              data-testid="drawer-backdrop"
              onClick={close}
              className="drawer-backdrop absolute inset-0 bg-black/70"
            />
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={nav("menu")}
              className="drawer-panel absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col overflow-y-auto border-r border-[color:var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
            >
              <button
                ref={closeRef}
                type="button"
                aria-label={menu("close")}
                onClick={close}
                className="mb-4 cursor-pointer self-end rounded-md p-1.5 text-[color:var(--muted)] transition-colors hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              {/* Any link inside the panel dismisses it, including a click on the
                game already open — the drawer must never sit over the board. */}
              <div
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("a")) close();
                }}
              >
                <DailyPanel />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
