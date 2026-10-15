import { type ReactElement } from "react";
import { buttonClasses, type ButtonProps } from "./buttonClasses";
import { CircleNotchIcon } from "@phosphor-icons/react";

export default function Button({
  variant = "primary",
  loading = false,
  type = "button",
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps): ReactElement {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${buttonClasses(variant)} ${className}`}
    >
      {loading && (
        <CircleNotchIcon
          size={16}
          className="animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
