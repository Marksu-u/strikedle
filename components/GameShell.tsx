import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import MenuDrawer from "./nav/MenuDrawer";

// Frame for the three game pages: a bar carrying the brand and the way out of
// the current game, and the board centred below it at full width. The day's
// figures live in the drawer at every size — a rail beside the board crowded it
// on the widths where it fitted and vanished on the widths where it did not.
export default function GameShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[var(--background)]/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <MenuDrawer />
          <Link
            href="/"
            className="cs2-display text-foreground text-xl font-extrabold uppercase italic"
          >
            Strike<span className="cs2-outline">dle</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-8">{children}</div>
    </div>
  );
}
