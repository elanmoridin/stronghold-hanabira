import { Metadata } from "next";
import params from "@/lib/static-params.json";

export function generateStaticParams() {
  return params.grammarpoint_titles.mandarin.map((title) => ({ slug: title }));
}

// Generate dynamic metadata (moved here from the client page)
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = await props.params;
  const decodedTitle = p.slug ? decodeURIComponent(p.slug) : "";

  return {
    title: `Mandarin Grammar Point: ${decodedTitle}`,
    description: `Learn about Chinese Mandarin grammar point "${decodedTitle}". This page provides a detailed explanation, examples, and usage.`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
