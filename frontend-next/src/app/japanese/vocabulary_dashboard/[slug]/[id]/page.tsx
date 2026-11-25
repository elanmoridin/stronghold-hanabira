import VocabularyHead from "@/components/VocabularyHead";
import ItemsSentences from "@/components/ItemsSentences";


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




