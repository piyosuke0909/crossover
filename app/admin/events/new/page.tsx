import AdminEventForm from "@/components/admin-event-form";
import BackLink from "@/components/back-link";

export default function NewAdminEventPage() {
  return (
    <main className="min-h-screen bg-[#f5fbfe] px-4 py-8 text-[#173042] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <BackLink href="/admin">管理画面へ戻る</BackLink>

        <section className="mt-5 rounded-[30px] border border-[#e1eef4] bg-white p-6 shadow-[0_12px_32px_rgba(50,99,121,0.07)] sm:p-8">
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
            CREATE EVENT
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">イベントを作成</h1>
          <p className="mt-2 text-sm text-[#728792]">
            作成後、イベント専用の会場QRを発行できます。
          </p>
          <AdminEventForm />
        </section>
      </div>
    </main>
  );
}
