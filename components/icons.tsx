import type { SVGProps } from "react";

type IconName =
  | "home"
  | "building"
  | "user-plus"
  | "search"
  | "calendar"
  | "pin"
  | "chevron"
  | "phone"
  | "globe"
  | "users"
  | "briefcase"
  | "lock"
  | "logout"
  | "sparkles";

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, className = "h-5 w-5", ...props }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
      {name === "home" && (
        <>
          <path {...common} d="M3.5 10.5 12 3.8l8.5 6.7" />
          <path {...common} d="M5.5 9.8v9.4h13V9.8" />
          <path {...common} d="M9.4 19.2v-5.4h5.2v5.4" />
        </>
      )}
      {name === "building" && (
        <>
          <path {...common} d="M4.5 20V5.5h10V20" />
          <path {...common} d="M14.5 9.5h5V20" />
          <path {...common} d="M8 9h3M8 13h3M8 17h3M17 13h.01M17 17h.01" />
          <path {...common} d="M2.8 20h18.4" />
        </>
      )}
      {name === "user-plus" && (
        <>
          <circle {...common} cx="9" cy="8" r="3.2" />
          <path {...common} d="M3.8 19c.4-3.5 2.3-5.4 5.2-5.4s4.8 1.9 5.2 5.4" />
          <path {...common} d="M18 7v6M15 10h6" />
        </>
      )}
      {name === "search" && (
        <>
          <circle {...common} cx="10.7" cy="10.7" r="5.7" />
          <path {...common} d="m15 15 4.5 4.5" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect {...common} x="4" y="5.5" width="16" height="14" rx="2.5" />
          <path {...common} d="M7.5 3.5v4M16.5 3.5v4M4 9.5h16" />
        </>
      )}
      {name === "pin" && (
        <>
          <path {...common} d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
          <circle {...common} cx="12" cy="10" r="2" />
        </>
      )}
      {name === "chevron" && <path {...common} d="m9 6 6 6-6 6" />}
      {name === "phone" && (
        <path {...common} d="M7.2 4.2 9.4 8l-1.7 1.7a14 14 0 0 0 6.6 6.6l1.7-1.7 3.8 2.2-.7 3.1c-.2.7-.8 1.1-1.5 1.1C9.6 21 3 14.4 3 6.4c0-.7.5-1.3 1.1-1.5l3.1-.7Z" />
      )}
      {name === "globe" && (
        <>
          <circle {...common} cx="12" cy="12" r="8.5" />
          <path {...common} d="M3.8 12h16.4M12 3.5c2 2.3 3 5.1 3 8.5s-1 6.2-3 8.5c-2-2.3-3-5.1-3-8.5s1-6.2 3-8.5Z" />
        </>
      )}
      {name === "users" && (
        <>
          <circle {...common} cx="9" cy="9" r="3" />
          <path {...common} d="M3.8 19c.4-3.4 2.2-5.1 5.2-5.1s4.8 1.7 5.2 5.1" />
          <path {...common} d="M15.8 7.2a2.7 2.7 0 0 1 0 5.2M16.7 14.4c2.2.6 3.3 2.1 3.5 4.6" />
        </>
      )}
      {name === "briefcase" && (
        <>
          <rect {...common} x="3.5" y="7.5" width="17" height="11.5" rx="2" />
          <path {...common} d="M8.5 7.5V5.7c0-.9.7-1.7 1.7-1.7h3.6c.9 0 1.7.8 1.7 1.7v1.8M3.5 12.5h17M10 12.5v2h4v-2" />
        </>
      )}
      {name === "lock" && (
        <>
          <rect {...common} x="5" y="10" width="14" height="10" rx="2.5" />
          <path {...common} d="M8 10V7.7a4 4 0 0 1 8 0V10" />
        </>
      )}
      {name === "logout" && (
        <>
          <path {...common} d="M10 5H5.8A1.8 1.8 0 0 0 4 6.8v10.4A1.8 1.8 0 0 0 5.8 19H10" />
          <path {...common} d="M14.5 8 18.5 12l-4 4M18 12H9" />
        </>
      )}
      {name === "sparkles" && (
        <>
          <path {...common} d="m12 3 1.1 3.2L16 7.4l-2.9 1.2L12 12l-1.1-3.4L8 7.4l2.9-1.2L12 3Z" />
          <path {...common} d="m18.5 12.5.7 2 1.8.7-1.8.8-.7 2-.7-2-1.8-.8 1.8-.7.7-2Z" />
          <path {...common} d="m5.5 13 .7 2 1.8.7-1.8.8-.7 2-.7-2-1.8-.8 1.8-.7.7-2Z" />
        </>
      )}
    </svg>
  );
}
