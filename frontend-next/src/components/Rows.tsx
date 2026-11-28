"use client"; // static export: data must be fetched in the browser, not at build time

import MySpeakerWaveIcon from "./MySpeakerWaveIcon";
import { Fragment, useEffect, useState } from "react";

import { E_API } from "@/lib/api";

interface Props {
  p_dashboardId: string;
  s_dashboardId: string;
}

const Rows: React.FC<Props> = ({ p_dashboardId, s_dashboardId }) => {
  // --- fetch data from backend API ---
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const pTag = p_dashboardId;
    const sTag = s_dashboardId;

    // Relative path: static export served from the same origin,
    // nginx proxies /e-api/v1 to the e-api backend.
    const apiUrl = `${E_API}/words?p_tag=${pTag}&s_tag=${sTag}`;

    async function fetchData() {
      console.log(apiUrl);
      //const response = await fetch(apiUrl, {next: {revalidate: 60}});             // force caching is bugged, shows many duplicates, revalidation also bugged
      const response = await fetch(apiUrl, { cache: "no-store" }); // force caching is bugged, shows many duplicates
      const data_payload = await response.json();
      setData(data_payload.words);
    }

    fetchData().catch((err) => console.error("Error fetching words:", err));
  }, [p_dashboardId, s_dashboardId]);


  // IDEAL FOR PROD,
  // shows max 2 sentences on small screens,
  // shows all sentences on large ones
  return (
    <div className="w-full">
      {data.map((word: any) => {
        return (
          <Fragment key={word.vocabulary_original}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-100 p-4 rounded-md flex flex-col md:flex-row items-start md:items-top relative">
                <div className="flex items-start mr-4">
                  <div className="h-8 w-8 p-1 rounded-full flex items-center justify-center bg-white border">
                    <MySpeakerWaveIcon audio_path={word.vocabulary_audio} />
                  </div>
                  <div className="ml-2">
                    <h1 className="text-2xl font-medium leading-tight">
                      {word.vocabulary_original}
                    </h1>
                    <p className="text-sm text-gray-500 mb-1">
                      {word.vocabulary_simplified}
                    </p>
                    <p className="text-sm text-gray-500">
                      {word.vocabulary_english}
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 md:relative md:top-auto md:right-auto md:flex-grow">
                  <p className="text-sm text-gray-500 text-right">
                    {word.word_type}
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {word.sentences.map((sentence: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className={`bg-gray-200 p-4 rounded-md ${
                        index >= 2 &&
                        "hidden md:block" /* Hide extra sentences on small screens */
                      }`}
                    >
                      <div className="flex items-start mb-0">
                        <div className="h-8 w-8 p-1 rounded-full flex items-center justify-center bg-white border">
                          <MySpeakerWaveIcon
                            audio_path={sentence.sentence_audio}
                          />
                        </div>
                        <div className="ml-2">
                          <h1 className="text-lg font-medium leading-tight">
                            {sentence.sentence_original}
                          </h1>
                          <p className="text-sm text-gray-500 mb-1">
                            {sentence.sentence_simplified}
                          </p>
                          <p className="text-sm text-gray-500 mb-1">
                            {sentence.sentence_romaji}
                          </p>
                          <p className="text-sm text-gray-500">
                            {sentence.sentence_english}
                          </p>
                        </div>
                      </div>
                      {/* <img src={sentence.sentence_picture} className="w-full border-2 rounded-lg max-w-full" alt="" /> */}
                    </div>
                  );
                })}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default Rows;
