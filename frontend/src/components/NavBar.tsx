import type { ReactElement } from "react";
import { Link } from "react-router";
import { SignOutIcon, SolarPanelIcon } from "@phosphor-icons/react";
import { useAuth } from "../auth/useAuth";
import Button from "./Button";

export default function NavBar(): ReactElement {
  const { email, logout } = useAuth();

  return (
    <header className="border-b border-border bg-surface shadow-card">
      <nav className="mx-auto max-w-6xl px-7 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <SolarPanelIcon
            size={32}
            weight="duotone"
            className="text-brand"
            aria-hidden="true"
          />
          Solar Sites
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">{email}</span>
          <Button variant="secondary" onClick={logout}>
            <SignOutIcon size={16} aria-hidden="true" />
            Log out
          </Button>
        </div>
      </nav>
    </header>
  );
}
