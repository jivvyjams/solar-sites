import { useState, type ReactElement, type SubmitEvent } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { lookupAddress } from "../api/address";
import { ApiError } from "../api/client";
import type { FoundAddress } from "../api/types";
import Button from "./Button";
import ErrorBanner from "./ErrorBanner";
import Field from "./Field";

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ApiError };

export default function AddressLookup({
  onFound,
}: {
  onFound: (found: FoundAddress) => void;
}): ReactElement {
  const [postcode, setPostcode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [state, setState] = useState<LookupState>({ status: "idle" });

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setState({ status: "loading" });
    try {
      onFound(await lookupAddress(postcode.trim(), houseNumber.trim()));
      setState({ status: "idle" });
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
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid items-start gap-4 sm:grid-cols-3">
        <Field
          label="Postcode"
          id="postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          error={fieldErrors.postcode && "Use a format like 2596 CG"}
        />
        <Field
          label="House number"
          id="houseNumber"
          value={houseNumber}
          onChange={(e) => setHouseNumber(e.target.value)}
          error={fieldErrors.houseNumber && "Enter a valid number"}
        />
        <Button
          type="submit"
          variant="secondary"
          loading={state.status === "loading"}
          className="mt-6.5 w-full"
        >
          <MagnifyingGlassIcon size={16} aria-hidden="true" />
          Look up
        </Button>
      </div>
      {state.status === "error" && !hasFieldErrors && (
        <ErrorBanner message={state.error.message} />
      )}
    </form>
  );
}
