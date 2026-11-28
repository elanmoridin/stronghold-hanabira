import VocabularyHead from "@/components/VocabularyHead";
import ItemsSentences from "@/components/ItemsSentences";

import staticParams from "@/lib/static-params.json";

export function generateStaticParams() {
  return staticParams.vocabulary_dashboard_combos.map(({ slug, id }) => ({
    slug,
    id,
  }));
}

export default async function VocabularyDashboard(props: {params: Promise<{ slug: string, id: string }>}) {
    const params = await props.params;
    console.log('----------------------------------')
    console.log(params)

    return (
    <div className="p-5">
        <VocabularyHead />
        <ItemsSentences params={params} />
    </div>
  );
}




