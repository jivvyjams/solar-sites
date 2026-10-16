import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router";
import RequireAuth from "./auth/RequireAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sites from "./pages/Sites";

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Sites />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
