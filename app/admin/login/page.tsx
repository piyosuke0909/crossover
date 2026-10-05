import { Icon } from "@/components/icons";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5fbfe] px-4 py-10">
      <section className="w-full max-w-md rounded-[30px] border border-[#e1eef4] bg-white p-6 shadow-[0_20px_50px_rgba(50,99,121,0.12)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[20px] bg-[#e5f7ff] text-[#249ed1]">
            <Icon name="lock" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#56add2]">
              CROSSOVER ADMIN
            </p>
            <h1 className="mt-1 text-xl font-extrabold">管理者ログイン</h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-[#6f8490]">
          管理者用パスワードを入力してください。
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm font-bold text-[#b94e4e]">
            {error === "config"
              ? "ADMIN_PASSWORD が設定されていません。"
              : "パスワードが違います。"}
          </div>
        ) : null}

        <form action="/api/admin/login" method="post" className="mt-6">
          <label className="text-sm font-extrabold text-[#3d5663]">
            パスワード
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              className="mt-2 w-full rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-3.5 outline-none transition focus:border-[#62bde5] focus:bg-white focus:ring-4 focus:ring-[#def4fe]"
              placeholder="••••••••"
            />
          </label>
          <button className="mt-5 w-full rounded-[20px] bg-[#4db7e5] px-5 py-4 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(55,166,214,0.27)] hover:bg-[#37a9da]">
            管理画面に入る
          </button>
        </form>
      </section>
    </main>
  );
}
