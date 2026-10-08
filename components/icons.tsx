import type { CSSProperties, HTMLAttributes } from "react";

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
  | "check-circle"
  | "eye-off"
  | "plus"
  | "person"
  | "download"
  | "mail"
  | "key"
  | "swap";

const MATERIAL_ICON: Record<IconName, string> = {
  home: "home",
  building: "apartment",
  "user-plus": "person_add",
  search: "search",
  calendar: "calendar_month",
  pin: "location_on",
  chevron: "chevron_right",
  "chevron-left": "chevron_left",
  "chevron-down": "expand_more",
  phone: "call",
  globe: "language",
  users: "groups",
  briefcase: "business_center",
  lock: "lock",
  logout: "logout",
  sparkles: "auto_awesome",
  qr: "qr_code_2",
  handshake: "handshake",
  pencil: "edit",
  trash: "delete",
  eye: "visibility",
  "check-circle": "verified",
  "eye-off": "visibility_off",
  plus: "add",
  person: "account_circle",
  download: "download",
  mail: "mail",
  key: "key",
  swap: "swap_horiz",
};

function inferFontSize(className: string) {
  if (className.includes("h-8") || className.includes("w-8")) return 32;
  if (className.includes("h-7") || className.includes("w-7")) return 28;
  if (className.includes("h-6") || className.includes("w-6")) return 24;
  if (className.includes("h-5") || className.includes("w-5")) return 20;
  if (className.includes("h-4") || className.includes("w-4")) return 16;
  if (className.includes("h-3.5") || className.includes("w-3.5")) return 14;
  return 20;
}

type IconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  name: IconName;
};

export function Icon({
  name,
  className = "h-5 w-5",
  style,
  ...props
}: IconProps) {
  const iconStyle: CSSProperties = {
    fontSize: inferFontSize(className),
    ...style,
  };

  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded shrink-0 ${className}`}
      style={iconStyle}
      {...props}
    >
      {MATERIAL_ICON[name]}
    </span>
  );
}
