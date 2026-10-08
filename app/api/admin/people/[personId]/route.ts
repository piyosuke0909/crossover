import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdminApiAuthenticated } from "@/lib/admin-api-auth";
import { validatePersonFields } from "@/lib/profile-validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ personId: string }> },
) {
  if (!(await isAdminApiAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { personId } = await context.params;
  const body = await request.json();

  if (typeof body.isHidden === "boolean" && Object.keys(body).length === 1) {
    await prisma.person.update({
      where: { id: personId },
      data: { isHidden: body.isHidden },
    });
    return NextResponse.json({ success: true });
  }

  const validation = validatePersonFields(body.person, false);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const existing = await prisma.person.findUnique({
    where: { id: personId },
    select: { photoUrl: true, email: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "担当者が見つかりません。" }, { status: 404 });
  }

  const person = validation.data;
  const previousEmail = existing.email?.trim().toLowerCase() ?? "";
  const nextEmail = person.email?.trim().toLowerCase() ?? "";
  const emailChanged = previousEmail !== nextEmail;

  await prisma.person.update({
    where: { id: personId },
    data: {
      name: person.name,
      photoUrl: person.photoUrl || existing.photoUrl,
      email: person.email,
      ...(emailChanged
        ? {
            emailVerifiedAt: null,
            emailOtpEnabled: false,
          }
        : {}),
      department: person.department,
      position: person.position,
      phone: person.phone,
      showPhone: person.showPhone,
      responsibility: person.responsibility,
      profile: person.profile,
    },
  });

  return NextResponse.json({ success: true });
}
