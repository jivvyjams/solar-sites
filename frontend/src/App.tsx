import { useEffect, useState } from "react";
import { request } from "./api/client";

type HealthResponse = {
  status: string;
};

export default function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const health = await request<HealthResponse>("/api/health");
        setStatus(health.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
    checkHealth();
  }, []);

  if (error !== null) {
    return <p>{error}</p>;
  }
  if (status === null) {
    return <p>Checking API</p>;
  }
  return <p>{status}</p>;
}
