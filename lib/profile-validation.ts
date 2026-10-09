export const MAX_PROFILE_TEXT_LENGTH = 200;

const PHONE_PATTERN = /^[0-9+()\-\s]{8,25}$/;
const POSTAL_CODE_PATTERN = /^\d{3}-?\d{4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProfileBody = {
  companyId?: unknown;
  companyAccessCode?: unknown;
  company?: {
    name?: unknown;
    phone?: unknown;
    showPhone?: unknown;
    showAddress?: unknown;
    postalCode?: unknown;
    address?: unknown;
    websiteUrl?: unknown;
    industryIds?: unknown;
    businessDescription?: unknown;
    profile?: unknown;
  };
  person?: {
    name?: unknown;
    email?: unknown;
    department?: unknown;
    position?: unknown;
    phone?: unknown;
    showPhone?: unknown;
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

export function validatePersonFields(person: ProfileBody["person"]) {
  const name = text(person?.name);
  const email = optionalText(person?.email);
  const department = optionalText(person?.department);
  const position = optionalText(person?.position);
  const phone = optionalText(person?.phone);
  const showPhone = person?.showPhone === true;
  const responsibility = optionalText(person?.responsibility);
  const profile = optionalText(person?.profile);

  if (!name) return { ok: false as const, error: "氏名は必須です。" };

  for (const [label, value] of [
    ["氏名", name],
    ["メールアドレス", email],
    ["部署", department],
    ["役職", position],
    ["担当者電話番号", phone],
    ["担当業務", responsibility],
    ["自己紹介", profile],
  ] as const) {
    const error = checkLength(label, value);
    if (error) return { ok: false as const, error };
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    return { ok: false as const, error: "担当者電話番号の形式が正しくありません。" };
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return { ok: false as const, error: "メールアドレスの形式が正しくありません。" };
  }

  return {
    ok: true as const,
    data: { name, email, department, position, phone, showPhone, responsibility, profile },
  };
}

export function validateCompanyFields(company: ProfileBody["company"]) {
  const name = text(company?.name);
  const phone = optionalText(company?.phone);
  const showPhone = company?.showPhone === true;
  const showAddress = company?.showAddress === true;
  const postalCode = optionalText(company?.postalCode);
  const address = optionalText(company?.address);
  const websiteUrl = optionalText(company?.websiteUrl);
  const businessDescription = text(company?.businessDescription);
  const profile = optionalText(company?.profile);
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

  if (!name) return { ok: false as const, error: "企業名は必須です。" };
  if (industryIds.length === 0) {
    return { ok: false as const, error: "業界を1つ以上選択してください。" };
  }
  if (!businessDescription) {
    return { ok: false as const, error: "事業内容は必須です。" };
  }

  for (const [label, value] of [
    ["企業名", name],
    ["会社電話番号", phone],
    ["郵便番号", postalCode],
    ["住所", address],
    ["Webサイト", websiteUrl],
    ["事業内容", businessDescription],
    ["企業プロフィール", profile],
  ] as const) {
    const error = checkLength(label, value);
    if (error) return { ok: false as const, error };
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    return { ok: false as const, error: "会社電話番号の形式が正しくありません。" };
  }
  if (postalCode && !POSTAL_CODE_PATTERN.test(postalCode)) {
    return { ok: false as const, error: "郵便番号は123-4567の形式で入力してください。" };
  }
  if (websiteUrl && !validHttpUrl(websiteUrl)) {
    return { ok: false as const, error: "WebサイトURLの形式が正しくありません。" };
  }

  return {
    ok: true as const,
    data: { name, phone, showPhone, showAddress, postalCode, address, websiteUrl, industryIds, businessDescription, profile },
  };
}

export function validateRegistrationBody(body: ProfileBody) {
  const person = validatePersonFields(body.person);
  if (!person.ok) return person;

  const companyId = text(body.companyId);
  const companyAccessCode = text(body.companyAccessCode);

  if (companyId) {
    return {
      ok: true as const,
      data: {
        mode: "existing" as const,
        companyId,
        companyAccessCode,
        person: person.data,
      },
    };
  }

  const company = validateCompanyFields(body.company);
  if (!company.ok) return company;

  return {
    ok: true as const,
    data: {
      mode: "new" as const,
      company: company.data,
      person: person.data,
    },
  };
}

export function validateProfileEditBody(body: ProfileBody) {
  const person = validatePersonFields(body.person);
  if (!person.ok) return person;

  const company = validateCompanyFields(body.company);
  if (!company.ok) return company;

  return {
    ok: true as const,
    data: { company: company.data, person: person.data },
  };
}
