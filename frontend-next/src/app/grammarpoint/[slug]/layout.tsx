import params from "@/lib/static-params.json";

export function generateStaticParams() {
  return params.grammarpoint_generic_titles.map((title) => ({ slug: title }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
