import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || "{}") as {
          eventId?: string;
        };

        if (!payload.eventId) {
          throw new Error("交流会情報がありません。");
        }

        const event = await prisma.event.findUnique({
          where: { id: payload.eventId },
          select: { id: true, isActive: true },
        });

        if (!event?.isActive) {
          throw new Error("この交流会には登録できません。");
        }

        if (!pathname.startsWith("events/" + event.id + "/people/")) {
          throw new Error("不正なアップロード先です。");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ eventId: event.id }),
        };
      },
      onUploadCompleted: async () => {
        // Blob URL is saved to Person.photoUrl by the registration API.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "画像アップロードに失敗しました。",
      },
      { status: 400 },
    );
  }
}
