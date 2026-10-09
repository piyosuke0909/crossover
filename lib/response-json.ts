/**
 * Decode application API JSON without leaking JSON parser errors into the UI.
 * Next.js can return an empty / HTML 500 response on server failures.
 */
export async function readApiJson<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  let payload: unknown = null;

  try {
    const text = await response.text();
    if (text) payload = JSON.parse(text) as unknown;
  } catch {
    // Error responses are not guaranteed to be JSON.
  }

  const error =
    payload && typeof payload === "object" && "error" in payload
      ? (payload as { error?: unknown }).error
      : null;

  if (!response.ok) {
    throw new Error(
      typeof error === "string" && error.trim()
        ? error
        : `${fallbackMessage}（HTTP ${response.status}）。DB更新状況とサーバーログを確認してください。`,
    );
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("サーバーから正しい応答を受け取れませんでした。もう一度お試しください。");
  }

  return payload as T;
}
