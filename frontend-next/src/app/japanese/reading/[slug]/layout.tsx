import { ReactNode } from "react";

import staticParams from "@/lib/static-params.json";

export function generateStaticParams() {
  return staticParams.reading_keys.map((slug) => ({ slug }));
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
