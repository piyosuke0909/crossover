/** Text-only avatar. Does not store or fetch user images. */
export default function PersonAvatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "h-7 w-7 rounded-xl text-xs",
    sm: "h-11 w-11 rounded-2xl text-sm",
    md: "h-16 w-16 rounded-[20px] text-xl",
    lg: "h-20 w-20 rounded-[26px] text-2xl",
    xl: "h-28 w-28 rounded-[32px] text-4xl",
  };
  const initial = Array.from(name.trim())[0] || "人";
  return (
    <span
      aria-label={name || "担当者"}
      className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-[#def4ff] to-[#fff0b5] font-extrabold text-[#278fb9] ring-1 ring-white/70 ${sizes[size]} ${className}`}
    >
      {initial}
    </span>
  );
}
