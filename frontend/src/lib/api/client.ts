/** A failed request; the status lets a feature show a more specific message. */
export class ApiError extends Error {
  /* `detail` is the text of a broken rule (status 422) or conflict (409) from the backend. */
  constructor(
    readonly status: number,
    readonly detail?: string,
  ) {
    super(detail ?? `Die Anfrage ist fehlgeschlagen (Status ${status}).`);
  }
}

async function failure(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string") {
      return new ApiError(response.status, body.detail);
    }
  } catch {
    // The answer has no JSON body; the status is enough.
  }
  return new ApiError(response.status);
}

/** Minimal JSON client for the backend API. Paths are relative (`/api/...`) and go through the dev proxy. */
export async function getJson<T>(
  path: string,
  headers: Record<string, string> = {},
): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: "application/json", ...headers },
  });
  if (!response.ok) {
    throw new ApiError(response.status);
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
    throw await failure(response);
  }
  return (await response.json()) as T;
}

/** Replaces a resource with a JSON body and returns the JSON answer. */
export async function putJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "PUT",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await failure(response);
  }
  return (await response.json()) as T;
}

/** Sends a JSON body; the backend answers without a body (status 204). */
export async function postNoContent(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new ApiError(response.status);
  }
}

/** Deletes a resource; the backend answers without a body. */
export async function deleteJson(
  path: string,
  headers: Record<string, string> = {},
): Promise<void> {
  const response = await fetch(path, { method: "DELETE", headers });
  if (!response.ok) {
    throw new ApiError(response.status);
  }
}
