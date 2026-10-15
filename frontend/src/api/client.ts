export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method,
    headers: { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 204) {
    return undefined as T;
  }
  if (!response.ok) {
    let message = response.statusText;
    try {
      const data: { detail?: unknown } = await response.json();
      if (typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // body was not JSON, keep statusText
    }
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}
