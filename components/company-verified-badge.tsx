import { Icon } from "@/components/icons";

export default function CompanyVerifiedBadge({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <span
      title="この担当者は企業参加コードで所属を確認済みです。運営者による本人確認を意味しません。"
      className="inline-flex items-center gap-1 rounded-full border border-[#bfe8d5] bg-[#eafaf1] px-2.5 py-1 text-[11px] font-extrabold text-[#24765a]"
    >
      <Icon name="check-circle" className="h-4 w-4" />
      {compact ? "認証済み" : "企業コード認証済み"}
    </span>
  );
}
