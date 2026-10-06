export const MAX_EVENT_TEXT_LENGTH = 200;

type EventInput = {
  name?: unknown;
  eventDate?: unknown;
  venue?: unknown;
  description?: unknown;
  isActive?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const valueText = text(value);
  return valueText || null;
}

function isWithinLimit(value: string) {
  return value.length <= MAX_EVENT_TEXT_LENGTH;
}

export function validateEventInput(input: EventInput) {
  const name = text(input.name);
  const venue = optionalText(input.venue);
  const description = optionalText(input.description);
  const eventDateRaw = text(input.eventDate);

  if (!name) {
    return { ok: false as const, error: "イベント名は必須です。" };
  }

  for (const [label, value] of [
    ["イベント名", name],
    ["会場", venue],
    ["説明", description],
  ] as const) {
    if (value && !isWithinLimit(value)) {
      return {
        ok: false as const,
        error: `${label}は${MAX_EVENT_TEXT_LENGTH}文字以内で入力してください。`,
      };
    }
  }

  if (!eventDateRaw) {
    return { ok: false as const, error: "開催日時は必須です。" };
  }

  const eventDate = new Date(eventDateRaw);
  if (Number.isNaN(eventDate.getTime())) {
    return { ok: false as const, error: "開催日時が正しくありません。" };
  }

  return {
    ok: true as const,
    data: {
      name,
      eventDate,
      venue,
      description,
      isActive:
        typeof input.isActive === "boolean" ? input.isActive : true,
    },
  };
}
