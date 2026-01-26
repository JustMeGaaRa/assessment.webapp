import type { Topic } from "../../types";

interface LibraryModuleTopicProps {
  topic: Topic;
  activeStack: string;
}

export const LibraryModuleTopic = ({
  topic,
  activeStack,
}: LibraryModuleTopicProps) => {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4 font-semibold text-slate-700">{topic.name}</td>
      <td className="px-6 py-4 font-medium text-slate-600">
        {topic.mappings?.[activeStack]}
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-xs font-bold text-indigo-500 hover:underline">
          Edit Mapping
        </button>
      </td>
    </tr>
  );
};
