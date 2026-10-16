import type { ReactElement } from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";

export default function Spinner({
  label = "Loading",
}: {
  label?: string;
}): ReactElement {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 py-12 text-sm text-text-muted"
    >
      <CircleNotchIcon
        size={20}
        weight="duotone"
        className="animate-spin text-accent"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}
