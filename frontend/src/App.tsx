import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router";
import RequireAuth from "./auth/RequireAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sites from "./pages/Sites";
import SiteForm from "./pages/SiteForm";
import SiteDetail from "./pages/SiteDetail";

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Sites />} />
        <Route path="/sites/new" element={<SiteForm key="new" />} />
        <Route path="/sites/:id" element={<SiteDetail />} />
        <Route path="/sites/:id/edit" element={<SiteForm key="edit" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
