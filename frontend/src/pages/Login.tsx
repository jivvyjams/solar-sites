import { useState, type SubmitEvent, type ReactElement } from "react";
import { Link, Navigate } from "react-router";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/useAuth";
import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import Field from "../components/Field";

export default function Login(): ReactElement {
  const { status, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "authed") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
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
    <main className="mx-auto max-w-6xl px-7 py-10 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-6 bg-surface rounded-card shadow-card p-8">
        <h1 className="font-display text-3xl">Log in</h1>

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
          <Field
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error?.fieldErrors.password}
          />
          <Button type="submit" loading={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="text-sm text-text-muted">
          No account yet?{" "}
          <Link
            to="/register"
            className="font-semibold text-accent hover:text-accent-hover rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
