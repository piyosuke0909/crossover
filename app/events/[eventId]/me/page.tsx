import Link from "next/link";
import QRCode from "qrcode";
import AppShell from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { getCurrentParticipant } from "@/lib/participant-session";
import { getRequestOrigin } from "@/lib/request-origin";

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
              <Icon name="qr" className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold">
              自分のQRを表示するには登録が必要です
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#718792]">
              この端末でプロフィール登録すると、自分専用QRを使えます。
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

  const origin = await getRequestOrigin();
  const meetUrl = `${origin}/events/${eventId}/meet/${participant.personId}`;
  const qrDataUrl = await QRCode.toDataURL(meetUrl, {
    width: 420,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#173042",
      light: "#ffffff",
    },
  });

  const person = participant.person;

  return (
    <AppShell eventId={eventId}>
      <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
            MY QR
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">自分のQR</h1>
          <p className="mt-2 text-sm text-[#718792]">
            話した相手にこのQRを読み取ってもらってください。
          </p>
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
            <p className="mt-2 text-xs leading-5 text-[#81949e]">
              このQRはこの交流会でのあなた専用です。
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
