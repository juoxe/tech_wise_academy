/** Minimal JSON client for the backend API. Paths are relative (`/api/...`) and go through the dev proxy. */
export async function getJson<T>(
  path: string,
  headers: Record<string, string> = {},
): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: "application/json", ...headers },
  });
  if (!response.ok) {
    throw new Error(
      `Die Anfrage ist fehlgeschlagen (Status ${response.status}).`,
    );
  }
  return (await response.json()) as T;
}

/** Sends a JSON body with optional extra headers and returns the JSON answer. */
export async function postJson<T>(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `Die Anfrage ist fehlgeschlagen (Status ${response.status}).`,
    );
  }
  return (await response.json()) as T;
}
