"use client";

// pages/GrammarPoint.tsx

import MarkdownContent from "@/components-markdown/MarkdownContent";
import FeaturesBanner from "@/components/FeaturesBanner";
import GrammarBreadcrumb from "@/components/GrammarBreadcrumb";
import PlayAudioButton from "@/components/PlayAudioButton";
import { E_API } from "@/lib/api";
import { use, useEffect, useState } from "react";

type GrammarPointProps = {
  params: Promise<{ slug: string }>;
};

type Example = {
  kr: string;
  romaji: string;
  en: string;
  grammar_audio: string;
};

type GrammarDetails = {
  title: string;
  short_explanation: string;
  formation: string;
  examples: Example[];
  long_explanation: string;
};

export default function GrammarPoint(props: GrammarPointProps) {
  const params = use(props.params);
  const decodedTitle = params.slug ? decodeURIComponent(params.slug) : "";

  const [grammarDetails, setGrammarDetails] = useState<GrammarDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //const payload = { title: decodedTitle };
    const payload = { title: decodedTitle.replace(/-/g, "/") };
    // korean has lots of slashes but these are in uri converted to dash
    // so we need to revert in call to DB, so we can find the titles with slashes

    fetch(`${E_API}/korean/grammar-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          // Handle error appropriately
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
    <div className="min-h-screen bg-gray-50">
      <FeaturesBanner />
      <div className="container mx-auto px-1 py-4">
        <GrammarBreadcrumb decodedTitle={decodedTitle} />

        <div className="bg-gradient-to-br from-blue-50 to-gray-100 shadow-lg rounded-xl p-2 md:p-2 mt-4">
          {/* <h1 className="text-2xl md:text-3xl font-bold text-gray-600 mb-4">
            Japanese JLPT Grammar Point
            <br />
            <span className="text-blue-600">{decodedTitle}</span>
          </h1> */}

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : grammarDetails ? (
            <>
              <GrammarExplanations grammarDetails={grammarDetails} />

              {/* Detailed Grammar Notes */}
              <div className="bg-white shadow-md rounded-lg p-2 md:p-2 mt-6">
                <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
                  Detailed Grammar Notes
                </h2>
                <MarkdownContent lang="kor" slug={params.slug} />
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">
              Grammar details not found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------
// components/GrammarExplanations.tsx

type GrammarExplanationsProps = {
  grammarDetails: GrammarDetails;
};

const GrammarExplanations: React.FC<GrammarExplanationsProps> = ({
  grammarDetails,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-2 mb-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-600 mb-4">
        Korean Grammar Point
        <br />
        <span className="text-blue-600">{grammarDetails.title}</span>
      </h1>

      {/* <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
        {grammarDetails.title}
      </h2> */}

      <div className="space-y-4">
        {/* Short Explanation */}
        <section>
          <p className="italic text-gray-700">
            {grammarDetails.short_explanation}
          </p>
        </section>

        {/* Formation */}
        <section>
          <p className="text-sm md:text-base font-semibold text-gray-800">
            Formation
          </p>
          <p className="text-gray-700 mt-1">{grammarDetails.formation}</p>
        </section>

        {/* Examples */}
        <section>
          <p className="text-sm md:text-base font-semibold text-gray-800 mb-2">
            Examples
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grammarDetails.examples.map((example, index) => (
              <div
                key={index}
                className="bg-blue-50 p-3 rounded-md shadow-sm flex items-start space-x-3 hover:bg-blue-100 transition-colors"
              >
                <PlayAudioButton
                  audioSrc={example.grammar_audio}
                  ariaLabel={`Play audio for example ${index + 1}`}
                />
                <div>
                  <p className="text-base text-gray-800">{example.kr}</p>
                  <p className="text-xs italic text-gray-600">
                    {example.romaji}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">{example.en}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Long Explanation */}
        <section>
          <p className="text-sm md:text-base font-semibold text-gray-800">
            Long Explanation
          </p>
          <p className="text-gray-700 mt-1">
            {grammarDetails.long_explanation}
          </p>
        </section>
      </div>
    </div>
  );
};

//export default GrammarExplanations;
