export const ADMIN_COOKIE_NAME = "crossover_admin_session";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function getAdminSessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;

  const input = new TextEncoder().encode(
    `crossover-admin-session:v1:${password}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", input);
  return toHex(digest);
}

export async function isValidAdminSession(value?: string) {
  if (!value) return false;
  const expected = await getAdminSessionToken();
  return Boolean(expected && value === expected);
}
