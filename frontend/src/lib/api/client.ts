/** Minimal JSON client for the backend API. Paths are relative (`/api/...`) and go through the dev proxy. */
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `Die Anfrage ist fehlgeschlagen (Status ${response.status}).`,
    );
  }
  return (await response.json()) as T;
}
