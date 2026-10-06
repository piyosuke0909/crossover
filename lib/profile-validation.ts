export const MAX_PROFILE_TEXT_LENGTH = 200;
export const MAX_FACE_PHOTO_BYTES = 5 * 1024 * 1024;

const PHONE_PATTERN = /^[0-9+()\-\s]{8,25}$/;
const POSTAL_CODE_PATTERN = /^\d{3}-?\d{4}$/;

type RegistrationBody = {
  company?: {
    name?: unknown;
    phone?: unknown;
    postalCode?: unknown;
    address?: unknown;
    websiteUrl?: unknown;
    industryIds?: unknown;
    businessDescription?: unknown;
    profile?: unknown;
  };
  person?: {
    name?: unknown;
    photoUrl?: unknown;
    department?: unknown;
    position?: unknown;
    phone?: unknown;
    responsibility?: unknown;
    profile?: unknown;
  };
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const valueText = text(value);
  return valueText || null;
}

function checkLength(label: string, value: string | null) {
  if (value && value.length > MAX_PROFILE_TEXT_LENGTH) {
    return `${label}は${MAX_PROFILE_TEXT_LENGTH}文字以内で入力してください。`;
  }
  return null;
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateRegistrationBody(body: RegistrationBody) {
  const company = body.company;
  const person = body.person;

  const companyName = text(company?.name);
  const companyPhone = optionalText(company?.phone);
  const postalCode = optionalText(company?.postalCode);
  const address = optionalText(company?.address);
  const websiteUrl = optionalText(company?.websiteUrl);
  const businessDescription = text(company?.businessDescription);
  const companyProfile = optionalText(company?.profile);

  const personName = text(person?.name);
  const photoUrl = text(person?.photoUrl);
  const department = optionalText(person?.department);
  const position = optionalText(person?.position);
  const personPhone = optionalText(person?.phone);
  const responsibility = optionalText(person?.responsibility);
  const personProfile = optionalText(person?.profile);

  const industryIds = Array.isArray(company?.industryIds)
    ? Array.from(
        new Set(
          company.industryIds
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      )
    : [];

  if (!companyName) {
    return { ok: false as const, error: "企業名は必須です。" };
  }
  if (industryIds.length === 0) {
    return { ok: false as const, error: "業界を1つ以上選択してください。" };
  }
  if (!businessDescription) {
    return { ok: false as const, error: "事業内容は必須です。" };
  }
  if (!personName) {
    return { ok: false as const, error: "氏名は必須です。" };
  }
  if (!photoUrl) {
    return { ok: false as const, error: "顔写真は必須です。" };
  }

  for (const [label, value] of [
    ["企業名", companyName],
    ["会社電話番号", companyPhone],
    ["郵便番号", postalCode],
    ["住所", address],
    ["Webサイト", websiteUrl],
    ["事業内容", businessDescription],
    ["企業プロフィール", companyProfile],
    ["氏名", personName],
    ["部署", department],
    ["役職", position],
    ["担当者電話番号", personPhone],
    ["担当業務", responsibility],
    ["自己紹介", personProfile],
  ] as const) {
    const error = checkLength(label, value);
    if (error) return { ok: false as const, error };
  }

  if (companyPhone && !PHONE_PATTERN.test(companyPhone)) {
    return { ok: false as const, error: "会社電話番号の形式が正しくありません。" };
  }
  if (personPhone && !PHONE_PATTERN.test(personPhone)) {
    return { ok: false as const, error: "担当者電話番号の形式が正しくありません。" };
  }
  if (postalCode && !POSTAL_CODE_PATTERN.test(postalCode)) {
    return { ok: false as const, error: "郵便番号は123-4567の形式で入力してください。" };
  }
  if (websiteUrl && !validHttpUrl(websiteUrl)) {
    return { ok: false as const, error: "WebサイトURLの形式が正しくありません。" };
  }

  return {
    ok: true as const,
    data: {
      company: {
        name: companyName,
        phone: companyPhone,
        postalCode,
        address,
        websiteUrl,
        industryIds,
        businessDescription,
        profile: companyProfile,
      },
      person: {
        name: personName,
        photoUrl,
        department,
        position,
        phone: personPhone,
        responsibility,
        profile: personProfile,
      },
    },
  };
}
