import { useState, type SubmitEvent, type ReactElement } from "react";
import { Link, Navigate } from "react-router";
import { SolarPanelIcon } from "@phosphor-icons/react";
import { ApiError } from "../api/client";
import background from "../assets/background.jpg";
import { useAuth } from "../auth/useAuth";
import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import Field from "../components/Field";
import PasswordField from "../components/PasswordField";

export default function Register(): ReactElement {
  const { status, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [error, setError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "authed") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setConfirmError(undefined);
    if (password !== confirm) {
      setConfirmError("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ email, password });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(0, "Could not reach the server. Try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen lg:flex">
      <section className="flex min-h-screen flex-col bg-surface px-7 py-10 sm:px-16 lg:w-lg lg:shrink-0">
        <div className="flex items-center gap-2 font-display text-2xl">
          <SolarPanelIcon
            size={48}
            weight="duotone"
            className="text-brand"
            aria-hidden="true"
          />
          Solar Sites
        </div>

        <div className="flex w-full max-w-xs flex-1 flex-col justify-center gap-6 py-10">
          <h1 className="font-display text-3xl">Create your account</h1>

          {error && <ErrorBanner message={error.message} />}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <Field
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error?.fieldErrors.email}
            />
            <PasswordField
              label="Password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error?.fieldErrors.password}
            />
            <PasswordField
              label="Confirm password"
              id="confirm-password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={confirmError}
            />
            <Button type="submit" loading={isSubmitting} className="self-start">
              Register
            </Button>
          </form>

          <p className="text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-accent hover:text-accent-hover rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>

      <div className="relative hidden lg:block lg:flex-1">
        <img
          src={background}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </main>
  );
}
