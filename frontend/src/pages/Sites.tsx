import type { ReactElement } from "react";

export default function Sites(): ReactElement {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="font-display text-3xl">Sites</h1>
      <p className="text-text-muted">Your client sites will appear here.</p>
    </section>
  );
}
