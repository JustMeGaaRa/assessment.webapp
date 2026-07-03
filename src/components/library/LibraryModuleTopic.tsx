import type { TechnologyTopic } from "../../lib/matrix/types";

interface LibraryModuleTopicProps {
  topic: TechnologyTopic;
}

export const LibraryModuleTopic = ({
  topic,
}: LibraryModuleTopicProps) => {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-4 py-3 md:px-6 md:py-4 font-semibold text-slate-700">
        {topic.topicName}
      </td>
      <td className="px-4 py-3 md:px-6 md:py-4 font-medium text-slate-600">
        {topic.technologyDescription}
      </td>
      <td className="px-4 py-3 md:px-6 md:py-4 text-right hidden md:table-cell">
        <button className="text-xs font-bold text-indigo-500 hover:underline">
          Edit Mapping
        </button>
      </td>
    </tr>
  );
};
