import { useEffect, useState } from "react";
import { request } from "./api/client";
import Button from "./components/Button";
import Field from "./components/Field";

type HealthResponse = {
  status: string;
};

function Scratch() {
  return (
    <div className="flex flex-col gap-16 mx-auto max-w-6xl px-7 py-10">
      <div className="flex flex-col gap-3">
        <Field label="name" id="name" />
        <Field label="email" id="email" type="email" />
        <Field
          label="number"
          id="number"
          error="Input should contain numbers only"
        />
        <Field label="password" id="password" type="password" />
      </div>
      <div className="flex gap-3 justify-center">
        <Button variant="primary">Add site</Button>
        <Button variant="secondary">View site</Button>
        <Button variant="primary" loading>
          Adding site...
        </Button>
        <Button variant="secondary" disabled>
          Edit site
        </Button>
        <Button variant="danger">Delete site</Button>
      </div>
    </div>
  );
}

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
  return (
    <>
      <Scratch />
      <p>{status}</p>
    </>
  );
}
