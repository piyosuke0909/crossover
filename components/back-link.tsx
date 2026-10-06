import Link from "next/link";
import { Icon } from "@/components/icons";

export default function BackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#dcebf2] bg-white px-3.5 py-2 text-sm font-extrabold text-[#4b7c92] shadow-[0_4px_14px_rgba(50,99,121,0.05)] transition hover:border-[#bfe0ee] hover:bg-[#f5fbfe] hover:text-[#278fb9]"
    >
      <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f7fd] text-[#279fd1]">
        <Icon name="chevron-left" className="h-4 w-4" />
      </span>
      <span className="max-w-[220px] truncate sm:max-w-none">{children}</span>
    </Link>
  );
}
