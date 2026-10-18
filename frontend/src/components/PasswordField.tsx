import { useState, type ComponentProps, type ReactElement } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import Field from "./Field";

type PasswordFieldProps = Omit<ComponentProps<typeof Field>, "type" | "trailing">;

export default function PasswordField(props: PasswordFieldProps): ReactElement {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeSlashIcon : EyeIcon;

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex h-8 w-8 items-center justify-center rounded-control text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Icon size={20} aria-hidden="true" />
        </button>
      }
    />
  );
}
