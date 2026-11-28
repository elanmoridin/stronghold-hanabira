"use client";

// buttons must be imported as client components to server side rendered page
import PlayAudioButton from "@/components/PlayAudioButton";

import FeaturesBanner from "@/components/FeaturesBanner";
import GrammarBreadcrumb from "@/components/GrammarBreadcrumb";
import { E_API } from "@/lib/api";
import { use, useEffect, useState } from "react";

type GrammarDetails = {
  title: string;
  short_explanation: string;
  formation: string;
  examples: {
    vn: string;
    romaji: string;
    en: string;
    grammar_audio: string;
  }[];
  long_explanation: string;
};

export default function GrammarPoint(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(props.params);
  const decodedTitle = params.slug ? decodeURIComponent(params.slug) : "";

  const [grammarDetails, setGrammarDetails] = useState<GrammarDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const payload = { title: decodedTitle };

    fetch(`${E_API}/vietnamese/grammar-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch grammar details");
        }
        return res.json();
      })
      .then((data) => {
        setGrammarDetails(data.grammar ?? null);
      })
      .catch((error) => {
        console.error("Error fetching grammar details:", error);
        setGrammarDetails(null);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedTitle]);

  return (
    <>
      <FeaturesBanner />
      <GrammarBreadcrumb decodedTitle={decodedTitle} />

      <div className="flex flex-col items-left w-99 max-w-1400px h-auto overflow-hidden m-5 my-1 px-1 py-1">
        <h1 className="text-2xl font-bold mb-4 font-roboto">
          Vietnamese Grammar Point <br /> {decodedTitle}
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          grammarDetails && (
            <div className="flex flex-col items-center w-99 max-w-1400px h-auto border border-gray-300 rounded-lg shadow-md bg-slate-200 overflow-hidden m-3 my-4 px-6 py-8">
              <h2 className="text-xl font-bold mb-10">{grammarDetails.title}</h2>
              <div className="grid grid-cols-1 gap-4 w-full">
                <p className="text-lg font-bold">Short explanation:</p>
                <div className="text-lg mb-2">
                  {grammarDetails.short_explanation}
                </div>

                <p className="text-lg font-bold mt-2">Formation:</p>
                <div className="text-lg mb-2">{grammarDetails.formation}</div>

                <div className="w-full">
                  <p className="text-lg font-bold mb-2">Examples:</p>
                  <div className="flex flex-col gap-4">
                    {grammarDetails.examples.map(
                      (example: any, index: number) => (
                        <div key={index} className="flex items-center mb-4">
                          <div className="flex items-start">
                            <PlayAudioButton audioSrc={example.grammar_audio} />
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <div className="text-lg font-normal mb-2">
                                  {example.vn}
                                </div>
                              </div>
                              <div className="text-lg italic mb-2">
                                {example.romaji}
                              </div>
                              <div className="text-lg">{example.en}</div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="text-lg mb-2">
                  <p className="font-bold">Long explanation:</p>
                  <div>{grammarDetails.long_explanation}</div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
