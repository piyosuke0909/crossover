import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "building"
  | "user-plus"
  | "search"
  | "calendar"
  | "pin"
  | "chevron"
  | "chevron-left"
  | "chevron-down"
  | "phone"
  | "globe"
  | "users"
  | "briefcase"
  | "lock"
  | "logout"
  | "sparkles"
  | "qr"
  | "handshake"
  | "pencil"
  | "trash"
  | "eye"
  | "eye-off"
  | "plus";

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, className = "h-5 w-5", ...props }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      {...common}
      {...props}
    >
      {name === "home" && (
        <>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </>
      )}
      {name === "building" && (
        <>
          <rect x="4" y="3" width="12" height="18" rx="2" />
          <path d="M16 8h4v13h-4M8 7h4M8 11h4M8 15h4M8 19h4" />
        </>
      )}
      {name === "user-plus" && (
        <>
          <circle cx="9" cy="8" r="4" />
          <path d="M2.5 21a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" />
        </>
      )}
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </>
      )}
      {name === "pin" && (
        <>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      )}
      {name === "chevron" && <path d="m9 18 6-6-6-6" />}
      {name === "chevron-left" && <path d="m15 18-6-6 6-6" />}
      {name === "chevron-down" && <path d="m6 9 6 6 6-6" />}
      {name === "phone" && (
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z" />
      )}
      {name === "globe" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </>
      )}
      {name === "users" && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
        </>
      )}
      {name === "briefcase" && (
        <>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
        </>
      )}
      {name === "lock" && (
        <>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
      )}
      {name === "logout" && (
        <>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        </>
      )}
      {name === "sparkles" && (
        <>
          <path d="m12 3-1.1 3.2L8 7.5l2.9 1.3L12 12l1.1-3.2L16 7.5l-2.9-1.3L12 3Z" />
          <path d="m19 13-.8 2.2L16 16l2.2.8L19 19l.8-2.2L22 16l-2.2-.8L19 13Z" />
          <path d="m5 13-.8 2.2L2 16l2.2.8L5 19l.8-2.2L8 16l-2.2-.8L5 13Z" />
        </>
      )}
      {name === "qr" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM18 14h3M18 18h3v3h-3M14 19v2" />
        </>
      )}
      {name === "handshake" && (
        <>
          <path d="m11 17 2 2a2 2 0 0 0 3-3l-3-3" />
          <path d="m14 14 2 2a2 2 0 0 0 3-3l-4.5-4.5a2 2 0 0 0-2.8 0L10 10.2a2 2 0 0 1-2.8-2.8l1.6-1.6" />
          <path d="m7 8-3-3-3 3 6 6M17 8l3-3 3 3-6 6" />
        </>
      )}
      {name === "pencil" && (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </>
      )}
      {name === "trash" && (
        <>
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" />
        </>
      )}
      {name === "eye" && (
        <>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {name === "eye-off" && (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A11 11 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.3M6.6 6.6C3.5 8.4 2 12 2 12s3.5 8 10 8a10 10 0 0 0 4.4-1" />
        </>
      )}
      {name === "plus" && <path d="M12 5v14M5 12h14" />}
    </svg>
  );
}
