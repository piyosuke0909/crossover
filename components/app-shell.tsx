import Link from "next/link";
import BottomNav from "@/components/bottom-nav";

export default function AppShell({
  children,
  eventId,
  showBottomNav = true,
}: {
  children: React.ReactNode;
  eventId?: string;
  showBottomNav?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f5fbfe] text-[#173042]">
      <header className="sticky top-0 z-30 border-b border-[#e4f0f5] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight">
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-2xl bg-[#4db7e5] text-white shadow-sm">
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#fff0a8]" />
              <span className="relative text-lg">C</span>
            </span>
            <span className="text-[17px]">Crossover</span>
          </Link>
          <span className="rounded-full bg-[#fff5c9] px-3 py-1.5 text-[11px] font-bold text-[#6e5a13]">
            企業交流
          </span>
        </div>
      </header>
      {children}
      {showBottomNav && eventId ? <BottomNav eventId={eventId} /> : null}
    </div>
  );
}
