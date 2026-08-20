"use client";

const ICON_PATHS = {
  hint: (
    <path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.55 1.1 1.35 1.1 2.2h5c0-.85.4-1.65 1.1-2.2A6 6 0 0 0 12 3Z" />
  ),
  help: (
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.6 9.2a2.4 2.4 0 1 1 3.3 2.2c-.75.3-.9.95-.9 1.6M12 16.4h.01" />
  ),
  giveup: <path d="M6 21V4m0 .5h11.5l-2.5 3.75 2.5 3.75H6" />,
} as const;

export type GameActionIcon = keyof typeof ICON_PATHS;

function Icon({ name }: { name: GameActionIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

export type GameActionItem = {
  id: string;
  label: string;
  icon: GameActionIcon;
  note?: string; // e.g. "2/4" — shown after the label, understated
  disabled?: boolean;
  onSelect: () => void;
};

// The side actions, on the board rather than behind a burger. They belong to
// the puzzle in front of the player, so hiding them behind a click cost a tap
// on every hint and made "give up" harder to find than to reach for.
export default function GameActions({ items }: { items: GameActionItem[] }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.disabled}
          onClick={item.onSelect}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3.5 text-sm font-semibold text-[color:var(--muted)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[color:var(--border)] disabled:hover:text-[color:var(--muted)]"
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
          {item.note && (
            <span className="font-mono text-xs opacity-70">{item.note}</span>
          )}
        </button>
      ))}
    </div>
  );
}
