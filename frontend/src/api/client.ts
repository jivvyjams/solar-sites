let csrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type ValidationIssue = {
  loc: (string | number)[];
  msg: string;
};

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (method !== "GET" && csrfToken !== null) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 204) {
    return undefined as T;
  }
  if (!response.ok) {
    let message = response.statusText;
    const fieldErrors: Record<string, string> = {};
    try {
      const data: { detail?: unknown } = await response.json();
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = "Please check the highlighted fields.";
        for (const issue of data.detail as ValidationIssue[]) {
          const field = String(issue.loc[issue.loc.length - 1]);
          fieldErrors[field] = issue.msg.replace(/^Value error, /, "");
        }
      }
    } catch {
      // body was not JSON, keep statusText
    }
    throw new ApiError(response.status, message, fieldErrors);
  }
  return (await response.json()) as T;
}
