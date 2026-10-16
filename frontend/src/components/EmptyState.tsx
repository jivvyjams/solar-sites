import type { ReactElement, ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  message,
  action,
}: EmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-12 text-center shadow-card">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="text text-text-muted">{message}</p>
      {action}
    </div>
  );
}
