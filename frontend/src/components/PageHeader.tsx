import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeftIcon } from "@phosphor-icons/react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backLink?: { to: string; label: string };
  action?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  backLink,
  action,
}: PageHeaderProps): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      {backLink && (
        <Link
          to={backLink.to}
          className="inline-flex items-center gap-1.5 self-start rounded-control text-sm font-semibold text-accent hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          {backLink.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
