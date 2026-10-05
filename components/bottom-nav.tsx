"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

export default function BottomNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const items = [
    { href: `/events/${eventId}`, label: "ホーム", icon: "home" as const },
    {
      href: `/events/${eventId}/companies`,
      label: "企業",
      icon: "building" as const,
    },
    {
      href: `/events/${eventId}/met`,
      label: "話した人",
      icon: "handshake" as const,
    },
    {
      href: `/events/${eventId}/me`,
      label: "自分",
      icon: "qr" as const,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-40 px-3 sm:bottom-5">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-[28px] border border-white/80 bg-white/95 px-2 py-2 shadow-[0_14px_40px_rgba(43,99,126,0.18)] backdrop-blur">
        {items.map((item) => {
          const active =
            item.href === `/events/${eventId}`
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-16 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-bold transition ${
                active
                  ? "bg-[#e6f7ff] text-[#239ed1]"
                  : "text-[#7b8e99] hover:bg-[#f5fbfe]"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
