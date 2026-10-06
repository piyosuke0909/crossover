import prisma from "@/lib/prisma";
import { sendGmailMessage } from "@/lib/gmail-mailer";
import {
  hashOtpCode,
  hashReloginCode,
  newOtpCode,
  newReloginCode,
  normalizeEmail,
  otpExpiry,
} from "@/lib/participant-auth";

type OtpPurpose = "LOGIN" | "VERIFY_EMAIL";

export async function sendParticipantOtp({
  personId,
  email,
  eventId,
  purpose,
}: {
  personId: string;
  email: string;
  eventId?: string;
  purpose: OtpPurpose;
}) {
  const normalizedEmail = normalizeEmail(email);
  const recent = await prisma.emailOtpChallenge.findFirst({
    where: {
      personId,
      purpose,
      createdAt: { gt: new Date(Date.now() - 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (recent) {
    throw new Error("OTP_COOLDOWN");
  }

  const code = newOtpCode();
  const challenge = await prisma.emailOtpChallenge.create({
    data: {
      personId,
      eventId: eventId ?? null,
      purpose,
      email: normalizedEmail,
      codeHash: hashOtpCode(code),
      expiresAt: otpExpiry(),
    },
  });

  const subject =
    purpose === "VERIFY_EMAIL"
      ? "【Crossover】メールOTPの確認コード"
      : "【Crossover】再ログイン用OTP";

  const text =
    purpose === "VERIFY_EMAIL"
      ? [
          "CrossoverのメールOTP設定を有効にするための確認コードです。",
          "",
          `確認コード: ${code}`,
          "",
          "有効期限は10分です。",
          "心当たりがない場合は、このメールを無視してください。",
        ].join("\n")
      : [
          "Crossoverへ再ログインするためのOTPです。",
          "",
          `確認コード: ${code}`,
          "",
          "有効期限は10分です。",
          "心当たりがない場合は、このメールを無視してください。",
        ].join("\n");

  try {
    await sendGmailMessage({ to: normalizedEmail, subject, text });
  } catch (error) {
    await prisma.emailOtpChallenge.delete({ where: { id: challenge.id } });
    throw error;
  }

  return { challengeId: challenge.id };
}

export async function verifyParticipantOtp({
  personId,
  email,
  eventId,
  purpose,
  code,
}: {
  personId: string;
  email: string;
  eventId?: string;
  purpose: OtpPurpose;
  code: string;
}) {
  const challenge = await prisma.emailOtpChallenge.findFirst({
    where: {
      personId,
      purpose,
      email: normalizeEmail(email),
      eventId: eventId ?? null,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.attempts >= 5) {
    return false;
  }

  if (challenge.codeHash !== hashOtpCode(code)) {
    await prisma.emailOtpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  await prisma.emailOtpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
  return true;
}

export async function issueReloginCode(personId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { id: true, name: true, email: true, isHidden: true },
  });

  if (!person || person.isHidden) {
    throw new Error("PERSON_NOT_FOUND");
  }
  if (!person.email) {
    throw new Error("EMAIL_REQUIRED");
  }

  const code = newReloginCode();
  const credential = await prisma.$transaction(async (tx) => {
    await tx.personLoginCredential.updateMany({
      where: { personId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return tx.personLoginCredential.create({
      data: {
        personId,
        codeHash: hashReloginCode(code),
      },
    });
  });

  try {
    await sendGmailMessage({
      to: person.email,
      subject: "【Crossover】再ログインIDを発行しました",
      text: [
        `${person.name} 様`,
        "",
        "Crossoverの再ログインIDを発行しました。",
        "",
        `再ログインID: ${code}`,
        "",
        "このIDは、参加済みの交流会へ再ログインするときに使用できます。",
        "新しいIDを発行すると、以前のIDは無効になります。",
        "第三者には共有しないでください。",
      ].join("\n"),
    });
  } catch (error) {
    await prisma.personLoginCredential.update({
      where: { id: credential.id },
      data: { revokedAt: new Date() },
    });
    throw error;
  }

  return { sentTo: person.email };
}
