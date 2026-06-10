import { Card } from "../ui/Card";
import { Check } from "lucide-react";
import { scoreStyles, dummySkillScores } from "./skillScoresData";

export const LibrarySkillScores = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummySkillScores.map((skill) => {
          const style = scoreStyles[skill.score] || scoreStyles[1];
          const IconComponent = style.icon;

          // Parse criteria into bullet points
          const criteriaList = skill.criteria
            .split("\n")
            .map((item) => item.replace(/^[•\s*-]+/, "").trim())
            .filter((item) => item.length > 0);

          return (
            <Card
              key={skill.score}
              hoverable
              className={`relative flex flex-col h-full border transition-all duration-300 group ${style.border} ${style.shadow}`}
            >
              {/* Top Accent Gradient Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.gradient}`}
              />

              <Card.Body className="flex flex-col flex-1">
                {/* Header Section */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${style.badge}`}
                      >
                        Level {skill.score}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors truncate">
                      {skill.label}
                    </h3>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-sm transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                  >
                    <IconComponent size={20} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-6 leading-relaxed flex-grow-0">
                  {skill.description}
                </p>

                {/* Divider */}
                <div className="border-t border-slate-100 my-4" />

                {/* Criteria Header */}
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Key Evaluation Criteria
                </h4>

                {/* Criteria List */}
                <ul className="space-y-2.5 flex-grow">
                  {criteriaList.map((crit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed"
                    >
                      <span
                        className={`p-0.5 rounded-full ${style.bg} ${style.text} mt-0.5 flex-shrink-0`}
                      >
                        <Check size={10} className="stroke-[3]" />
                      </span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
