import type { Topic } from "../../types";

interface AssessmentTopicProps {
  topic: Topic;
  selectedStack: string;
  score: number | undefined;
  note: string;
  onScore: (id: string, score: number) => void;
  onNote: (id: string, note: string) => void;
  isReadOnly?: boolean;
}

export const AssessmentTopic = ({
  topic,
  selectedStack,
  score,
  note,
  onScore,
  onNote,
  isReadOnly,
}: AssessmentTopicProps) => {
  return (
    <div className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors p-4 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-700 mb-2 flex flex-col">
          <span className="text-base text-balance leading-snug">
            {topic.name}
          </span>
          {topic.mappings && topic.mappings[selectedStack] && (
            <span className="text-indigo-600 text-sm font-bold mt-1 flex items-center gap-1.5">
              {topic.mappings[selectedStack]}
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder={
            isReadOnly
              ? "No specific observation."
              : "Add specific observation..."
          }
          className="w-full text-xs text-slate-500 bg-transparent border-none focus:ring-0 p-0 placeholder:italic disabled:opacity-50 disabled:cursor-not-allowed"
          value={note}
          onChange={(e) => onNote(topic.id, e.target.value)}
          disabled={isReadOnly}
        />
      </div>
      <div className="w-full md:w-auto pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-1.5 md:gap-1 min-w-max md:min-w-0 md:justify-end">
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="relative group/tooltip">
              <button
                disabled={isReadOnly}
                onClick={() => onScore(topic.id, num)}
                className={`w-10 h-10 md:w-8 md:h-8 rounded-xl md:rounded-lg text-sm md:text-xs font-bold transition-all border relative z-0 disabled:cursor-not-allowed disabled:opacity-70 flex-shrink-0 touch-manipulation
                ${
                  score === num
                    ? "bg-indigo-600 text-white border-indigo-600 scale-105 md:scale-110 shadow-md z-10"
                    : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                } ${isReadOnly && score !== num ? "opacity-30 grayscale" : ""}`}
              >
                {num}
              </button>
              {/* Tooltip hidden on mobile touch devices usually, but kept for desktop */}
              <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                {
                  {
                    0: "N/A",
                    1: "Novice",
                    2: "Beginner",
                    3: "Competent",
                    4: "Proficient",
                    5: "Expert",
                  }[num]
                }
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
