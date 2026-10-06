import { notFound } from "next/navigation";
import QRCode from "qrcode";
import prisma from "@/lib/prisma";
import { getRequestOrigin } from "@/lib/request-origin";
import { Icon } from "@/components/icons";
import BackLink from "@/components/back-link";

export const dynamic = "force-dynamic";

export default async function AdminEventQrPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    include: {
      _count: {
        select: {
          eventCompanies: true,
          eventPeople: true,
        },
      },
    },
  });

  if (!event) notFound();

  const origin = await getRequestOrigin();
  const eventUrl = `${origin}/events/${event.id}`;
  const qrDataUrl = await QRCode.toDataURL(eventUrl, {
    width: 520,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#173042",
      light: "#ffffff",
    },
  });

  return (
    <main className="min-h-screen bg-[#f5fbfe] px-4 py-8 text-[#173042] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin">管理画面へ戻る</BackLink>

        <section className="mt-5 overflow-hidden rounded-[32px] border border-[#e1eef4] bg-white shadow-[0_18px_45px_rgba(50,99,121,0.1)]">
          <div className="bg-gradient-to-br from-[#e5f7ff] to-[#fff7cf] p-6 sm:p-8">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-white text-[#279fd1] shadow-sm">
                <Icon name="qr" className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
                    EVENT QR
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      event.isActive
                        ? "bg-[#e8f8ee] text-[#47865d]"
                        : "bg-white/70 text-[#7c8a91]"
                    }`}
                  >
                    {event.isActive ? "公開中" : "非公開"}
                  </span>
                </div>
                <h1 className="mt-1 break-words text-2xl font-extrabold">
                  {event.name}
                </h1>
                <p className="mt-2 text-sm font-medium text-[#667d88]">
                  交流会ごとに1つの会場QRです。
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mx-auto max-w-[390px] rounded-[30px] bg-white p-4 ring-1 ring-[#dfeef4]">
              <img
                src={qrDataUrl}
                alt={`${event.name} の会場QRコード`}
                className="h-auto w-full"
              />
            </div>

            {!event.isActive ? (
              <p className="mt-5 rounded-2xl bg-[#fff5c9] px-4 py-3 text-center text-xs font-extrabold leading-5 text-[#76641f]">
                現在は非公開のため、このQRを読み取っても参加者画面は表示されません。
              </p>
            ) : null}

            <p className="mt-5 break-all rounded-2xl bg-[#f7fbfd] px-4 py-3 text-center text-xs font-bold leading-5 text-[#607783]">
              {eventUrl}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#e9f8ff] p-4 text-center">
                <p className="text-2xl font-extrabold">
                  {event._count.eventCompanies}
                </p>
                <p className="mt-1 text-xs font-bold text-[#66808d]">
                  参加企業
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff8d8] p-4 text-center">
                <p className="text-2xl font-extrabold">
                  {event._count.eventPeople}
                </p>
                <p className="mt-1 text-xs font-bold text-[#766a3d]">
                  参加担当者
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
