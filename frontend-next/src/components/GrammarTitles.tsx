"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { E_API } from "@/lib/api";

interface GrammarTitlesProps {
  lang: string;
  pTag: string;
  slug: string;
}

const GrammarTitles: React.FC<GrammarTitlesProps> = ({ lang, pTag, slug }) => {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // we have SLASH workaround for Korean language, since it has lots of slashes,
  // but google does not want to index these

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await fetch(`${E_API}/grammar-titles?p_tag=${pTag}`);
        const data = await response.json();
        setTitles(data.titles || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTitles();
  }, [pTag]);

  const encodeTitle = (title: string) => {
    //return encodeURIComponent(title);
    // WORKAROUND Replace slashes with dashes before encoding
    return encodeURIComponent(title.replace(/\//g, "-"));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-xl px-5">
        <h2 className="text-2xl font-bold mb-4 py-8">
          {lang} grammar list for {pTag}:
        </h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-5">
      <h2 className="text-2xl font-bold mb-4 py-8">
        {lang} grammar list for {pTag}:
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {titles.map((title: any, index: any) => (
          <Link
            key={index}
            href={`${slug}/${encodeTitle(title)}`}
            className="p-4 border rounded-md shadow-md bg-gray-100 hover:bg-blue-100 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GrammarTitles;
