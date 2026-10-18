import { useState, type ReactElement, type SubmitEvent } from "react";
import { ApiError } from "../api/client";
import { getBattery } from "../api/sites";
import type { Battery } from "../api/types";
import BatteryResult from "./BatteryResult";
import Button from "./Button";
import ErrorBanner from "./ErrorBanner";
import Field from "./Field";
import Spinner from "./Spinner";

type BatteryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; battery: Battery };

export default function BatterySection({
  siteId,
}: {
  siteId: string;
}): ReactElement {
  const [capacityKwh, setCapacityKwh] = useState("5");
  const [annualUseKwh, setAnnualUseKwh] = useState("3500");
  const [state, setState] = useState<BatteryState>({ status: "idle" });

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setState({ status: "loading" });
    try {
      const battery = await getBattery(
        siteId,
        capacityKwh.trim().replace(",", "."),
        annualUseKwh.trim().replace(",", "."),
      );
      setState({ status: "success", battery });
    } catch (err) {
      setState({
        status: "error",
        error:
          err instanceof ApiError
            ? err
            : new ApiError(0, "Could not reach the server. Try again."),
      });
    }
  }

  const fieldErrors = state.status === "error" ? state.error.fieldErrors : {};

  return (
    <section className="flex flex-col gap-6 rounded-card bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl">
          Self-consumption with a battery
        </h2>
        <p className="text-sm text-text-muted">
          PVGIS household profile, hourly simulation, 90 % round-trip
          efficiency, 2023 weather
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-wrap items-start gap-4"
      >
        <Field
          label="Battery capacity (kWh)"
          id="capacityKwh"
          className="w-50"
          value={capacityKwh}
          onChange={(e) => setCapacityKwh(e.target.value)}
          error={fieldErrors.capacityKwh}
        />
        <Field
          label="Annual electricity use (kWh)"
          id="annualUseKwh"
          className="w-60"
          value={annualUseKwh}
          onChange={(e) => setAnnualUseKwh(e.target.value)}
          error={fieldErrors.annualUseKwh}
        />
        <Button
          type="submit"
          loading={state.status === "loading"}
          className="mt-6.5"
        >
          Calculate
        </Button>
      </form>
      {state.status === "loading" && <Spinner label="Asking PVGIS" />}
      {state.status === "error" && (
        <ErrorBanner message={state.error.message} />
      )}
      {state.status === "success" && <BatteryResult battery={state.battery} />}
    </section>
  );
}
