"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

export default function BottomNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const eventBase = `/events/${eventId}`;
  const relativePath = pathname.startsWith(eventBase)
    ? pathname.slice(eventBase.length)
    : "";
  const activeSegment = relativePath.split("/").filter(Boolean)[0] ?? "";

  const items = [
    { href: eventBase, label: "ホーム", icon: "home" as const, segment: "" },
    {
      href: `${eventBase}/companies`,
      label: "企業",
      icon: "building" as const,
      segment: "companies",
    },
    {
      href: `${eventBase}/met`,
      label: "話した人",
      icon: "handshake" as const,
      segment: "met",
    },
    {
      href: `${eventBase}/me`,
      label: "自分",
      icon: "person" as const,
      segment: "me",
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-40 px-3 sm:bottom-5">
      <div className="mx-auto grid max-w-md grid-cols-4 rounded-[28px] border border-white/80 bg-white/95 p-2 shadow-[0_14px_40px_rgba(43,99,126,0.18)] backdrop-blur">
        {items.map((item) => {
          const active = activeSegment === item.segment;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2.5 text-[11px] font-bold transition ${
                active
                  ? "bg-[#e6f7ff] text-[#239ed1]"
                  : "text-[#7b8e99] hover:bg-[#f5fbfe]"
              }`}
            >
              <span className="grid h-7 w-7 place-items-center">
                <Icon name={item.icon} className="h-6 w-6" />
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
