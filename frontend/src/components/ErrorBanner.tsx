import type { ReactElement } from "react";

export default function ErrorBanner({
  message,
}: {
  message: string;
}): ReactElement {
  return (
    <p
      role="alert"
      className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {message}
    </p>
  );
}
