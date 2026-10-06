import Link from "next/link";
import QRCode from "qrcode";
import AppShell from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { getCurrentParticipant } from "@/lib/participant-session";
import { getRequestOrigin } from "@/lib/request-origin";
import { getCompanyAccessCodeFromCookie } from "@/lib/company-access";

export const dynamic = "force-dynamic";

export default async function MyQrPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return (
      <AppShell eventId={eventId}>
        <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-8 sm:px-6">
          <section className="rounded-[30px] border border-[#e1eef4] bg-white p-7 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#e6f7ff] text-[#279fd1]">
              <Icon name="person" className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold">
              自分のページを使うには登録が必要です
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#718792]">
              この端末でプロフィール登録すると、個人QRやプロフィール編集を利用できます。
            </p>
            <Link
              href={`/events/${eventId}/register`}
              className="mt-5 inline-flex rounded-2xl bg-[#4db7e5] px-5 py-3 text-sm font-extrabold text-white"
            >
              プロフィール登録へ
            </Link>
          </section>
        </main>
      </AppShell>
    );
  }

  const person = participant.person;
  const qrToken = person.eventPeople[0]?.qrToken;
  const companyAccessCode = await getCompanyAccessCodeFromCookie(person.companyId);
  const origin = await getRequestOrigin();
  const meetUrl = qrToken
    ? `${origin}/events/${eventId}/meet/${qrToken}`
    : "";
  const qrDataUrl = meetUrl
    ? await QRCode.toDataURL(meetUrl, {
        width: 420,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#173042", light: "#ffffff" },
      })
    : null;

  return (
    <AppShell eventId={eventId}>
      <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
              MY PROFILE
            </p>
            <h1 className="mt-1 text-2xl font-extrabold">自分</h1>
          </div>
          <Link
            href={`/events/${eventId}/me/edit`}
            className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#d9eaf2] bg-white px-3.5 py-2 text-xs font-extrabold text-[#3f7f99]"
          >
            <Icon name="pencil" className="h-4 w-4" />
            編集
          </Link>
        </div>

        <section className="mt-5 overflow-hidden rounded-[32px] border border-[#e1eef4] bg-white shadow-[0_16px_40px_rgba(50,99,121,0.1)]">
          <div className="bg-gradient-to-br from-[#e5f7ff] to-[#fff9dc] p-6 text-center">
            <img
              src={person.photoUrl}
              alt={person.name}
              className="mx-auto h-20 w-20 rounded-[26px] border-4 border-white object-cover shadow-sm"
            />
            <h2 className="mt-3 text-xl font-extrabold">{person.name}</h2>
            <p className="mt-1 text-sm font-bold text-[#607783]">
              {person.company.name}
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {person.company.industries.map(({ industry }) => (
                <span
                  key={industry.id}
                  className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-[#348bab]"
                >
                  {industry.name}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 text-center sm:p-8">
            {qrDataUrl ? (
              <>
                <div className="mx-auto max-w-[330px] rounded-[28px] bg-white p-3 ring-1 ring-[#e3edf2]">
                  <img
                    src={qrDataUrl}
                    alt="話した人登録用QRコード"
                    className="h-auto w-full"
                  />
                </div>
                <p className="mt-5 text-sm font-extrabold">
                  読み取ると相手の「話した人」に追加されます
                </p>
              </>
            ) : (
              <p className="rounded-2xl bg-[#fff5c9] px-4 py-3 text-sm font-bold text-[#7d681f]">
                QR情報を準備できませんでした。DB migrationを確認してください。
              </p>
            )}
          </div>
        </section>

        {companyAccessCode ? (
          <section className="mt-5 rounded-[26px] border border-[#e1eef4] bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f7ff] text-[#278fb9]">
                <Icon name="lock" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-extrabold">企業参加コード</h2>
                <p className="mt-1 text-xs text-[#7c909b]">
                  同じ会社の担当者が登録するときに共有してください。
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-[#f5fbfe] px-4 py-4 text-center font-mono text-2xl font-extrabold tracking-[0.18em] text-[#245f78]">
              {companyAccessCode}
            </div>
          </section>
        ) : null}

        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/events/${eventId}/met`}
            className="flex items-center gap-3 rounded-[22px] border border-[#e1eef4] bg-white p-4 font-extrabold"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff4bf] text-[#8d711a]">
              <Icon name="handshake" className="h-5 w-5" />
            </span>
            話した人を見る
          </Link>
          <Link
            href={`/events/${eventId}/companies`}
            className="flex items-center gap-3 rounded-[22px] border border-[#e1eef4] bg-white p-4 font-extrabold"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e6f7ff] text-[#279fd1]">
              <Icon name="building" className="h-5 w-5" />
            </span>
            企業を探す
          </Link>
        </section>
      </main>
    </AppShell>
  );
}
