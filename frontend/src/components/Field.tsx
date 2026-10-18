import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

type FieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  id: string;
  error?: string;
  trailing?: ReactNode;
};

const inputBase =
  "h-10 w-full px-3 rounded-control border bg-surface text-base text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:border-brand disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed";
const inputValid = "border-border";
const inputInvalid = "border-danger";

export default function Field({
  label,
  id,
  error,
  trailing,
  className = "",
  ...rest
}: FieldProps): ReactElement {
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          id={id}
          className={`${inputBase} ${hasError ? inputInvalid : inputValid} ${trailing ? "pr-10" : ""}`}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? errorId : undefined}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </div>
        )}
      </div>
      {hasError && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
