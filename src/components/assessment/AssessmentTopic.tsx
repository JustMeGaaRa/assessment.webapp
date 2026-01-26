import type { Topic } from "../../types";

interface AssessmentTopicProps {
  topic: Topic;
  selectedStack: string;
  score: number | undefined;
  note: string;
  onScore: (id: string, score: number) => void;
  onNote: (id: string, note: string) => void;
}

export const AssessmentTopic = ({
  topic,
  selectedStack,
  score,
  note,
  onScore,
  onNote,
}: AssessmentTopicProps) => {
  return (
    <tr className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-700 mb-1 flex flex-col">
          <span className="text-base">{topic.name}</span>
          {topic.mappings && topic.mappings[selectedStack] && (
            <span className="text-indigo-600 text-sm font-bold mt-0.5 flex items-center gap-1.5">
              {topic.mappings[selectedStack]}
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder="Add specific observation..."
          className="w-full text-xs text-slate-500 bg-transparent border-none focus:ring-0 p-0 placeholder:italic"
          value={note}
          onChange={(e) => onNote(topic.id, e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onScore(topic.id, num)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border
                ${
                  score === num
                    ? "bg-indigo-600 text-white border-indigo-600 scale-110 shadow-md"
                    : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
            >
              {num}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
};
