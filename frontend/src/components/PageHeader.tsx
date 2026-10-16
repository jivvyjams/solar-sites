import type { ReactElement, ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  action?: ReactNode;
};

export default function PageHeader({
  title,
  action,
}: PageHeaderProps): ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl">{title}</h1>
      {action}
    </div>
  );
}
