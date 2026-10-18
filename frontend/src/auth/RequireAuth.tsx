import type { ReactElement } from "react";
import { Navigate, Outlet } from "react-router";
import NavBar from "../components/NavBar";
import Spinner from "../components/Spinner";
import { useAuth } from "./useAuth";

export default function RequireAuth(): ReactElement {
  const { status } = useAuth();

  if (status === "loading") {
    return <Spinner />;
  }
  if (status === "anon") {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-7 py-10">
        <Outlet />
      </main>
    </>
  );
}
