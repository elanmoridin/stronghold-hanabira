import { ReactNode } from "react";

import staticParams from "@/lib/static-params.json";

export function generateStaticParams() {
  return staticParams.grammar_dashboard_combos.map(({ slug, id }) => ({
    slug,
    id,
  }));
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
