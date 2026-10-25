/**
 * Abstract card art for the mega menu.
 *
 * Flat shapes only: the landing page has no photography, and these read as
 * placeholders that still look deliberate next to the type.
 */
export type MenuArtVariant = "cube" | "rings" | "grid";

const PALETTE: Record<MenuArtVariant, { field: string; ink: string; accent: string }> = {
  cube: { field: "#1d4f7c", ink: "#f6f4ec", accent: "#8fb4d4" },
  rings: { field: "#e9e4d6", ink: "#1d4f7c", accent: "#b6c9a5" },
  grid: { field: "#1f2a24", ink: "#f2efe4", accent: "#9db8a6" },
};

export function MenuArt({ variant, className }: { variant: MenuArtVariant; className?: string }) {
  const { field, ink, accent } = PALETTE[variant];

  return (
    <svg viewBox="0 0 320 132" preserveAspectRatio="none" className={className} aria-hidden focusable="false">
      <rect width="320" height="132" fill={field} />

      {variant === "cube" ? (
        <g fill="none" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" opacity="0.9">
          <path d="M160 34 L196 54 L196 94 L160 114 L124 94 L124 54 Z" />
          <path d="M124 54 L160 74 L196 54" />
          <path d="M160 74 L160 114" />
          <path d="M124 54 L160 74 L196 54" stroke={accent} strokeWidth="0.9" />
          <path d="M42 20 L42 112" stroke={accent} strokeWidth="0.9" strokeDasharray="3 6" />
        </g>
      ) : null}

      {variant === "rings" ? (
        <g opacity="0.95">
          <rect x="30" y="18" width="74" height="96" rx="37" fill={accent} opacity="0.85" />
          <rect x="96" y="18" width="74" height="96" rx="37" fill={ink} opacity="0.16" />
          <rect x="162" y="18" width="74" height="96" rx="37" fill={ink} opacity="0.09" />
          <rect x="228" y="18" width="62" height="96" rx="6" fill={ink} opacity="0.2" />
        </g>
      ) : null}

      {variant === "grid" ? (
        <g>
          <g fill={accent} opacity="0.5">
            {[0, 1, 2, 3, 4, 5].map((row) =>
              [0, 1, 2, 3, 4, 5, 6, 7].map((col) => (
                <circle key={`${row}-${col}`} cx={40 + col * 34} cy={26 + row * 16} r="1.6" />
              )),
            )}
          </g>
          <rect x="40" y="88" width="150" height="12" rx="2" fill={ink} opacity="0.85" />
          <rect x="40" y="106" width="92" height="6" rx="2" fill={ink} opacity="0.35" />
        </g>
      ) : null}
    </svg>
  );
}
