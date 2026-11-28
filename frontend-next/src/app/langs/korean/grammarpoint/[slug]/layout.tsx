import { Metadata } from "next";
import params from "@/lib/static-params.json";

export function generateStaticParams() {
  // Korean titles contain slashes; the URL convention replaces them with
  // dashes (same workaround as GrammarTitles.encodeTitle), and the page
  // converts dashes back to slashes for the API payload.
  return params.grammarpoint_titles.korean.map((title) => ({
    slug: title.replace(/\//g, "-"),
  }));
}

// Generate dynamic metadata (moved here from the client page)
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = await props.params;
  const decodedTitle = p.slug ? decodeURIComponent(p.slug) : "";

  return {
    title: `Korean Grammar Point: ${decodedTitle}`,
    description: `Learn about Korean grammar point "${decodedTitle}". This page provides a detailed explanation, examples, and usage.`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
