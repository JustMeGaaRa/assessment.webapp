import {
  AssessmentModuleStatistics,
  IndividualModuleScore,
  SkillLevel,
} from "@lib/matrix";
import { FC } from "react";
import "./AssessmentModuleDetails.css";
import { ColorPalette } from "@/constants/colors";
import { ProgressIndicator } from "./ProgressIndicator";

export const AssessmentModuleDetails: FC<{
  module: AssessmentModuleStatistics;
}> = ({ module }) => {
  return (
    <div className={"assessment-module"}>
      <div className="assessment-module-header">
        <div className={"assessment-module-header-left"}>
          <p className={"assessment-module-name text-h4"}>
            {module.moduleName}
          </p>
          <p className={"assessment-module-description text-body-2-compact"}>
            {module.description}
          </p>
        </div>
        <div className="assessment-module-header-right">
          <p className={"text-h4"}>
            {module.statistics.averageScore.toFixed(1)}
          </p>
          <p className={"assessment-module-level text-body-2-compact"}>
            Competent
          </p>
        </div>
      </div>
      <div className="assessment-module-content">
        {module.assessorStats.map((assessorStat, index) => (
          <div
            key={assessorStat.assessor.fullname}
            className={"assessor-stat-row"}
          >
            <span
              className={"assessor-stat-fullname text-body-2-compact-semi"}
              title={assessorStat.assessor.fullname}
            >
              {assessorStat.assessor.fullname}
            </span>
            <ProgressIndicator
              min={0}
              max={5}
              value={assessorStat.module.averageScore}
              fill={ColorPalette[index % ColorPalette.length]}
            />
            <span className={"text-body-2-compact-semi"}>
              {assessorStat.module.averageScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const IndividualFeedbackModuleDetails: FC<{
  module: IndividualModuleScore;
  skillLevels: SkillLevel[];
}> = ({ module, skillLevels }) => {
  return (
    <div className={"feedback-module"}>
      <div className="feedback-module-header">
        <div className={"feedback-module-header-left"}>
          <p className={"feedback-module-name text-h4"}>{module.moduleName}</p>
          <p className={"feedback-module-description text-body-2-compact"}>
            {"module.description"}
          </p>
        </div>
        <div className="feedback-module-header-right">
          <p className={"text-h4"}>{(0).toFixed(1)}</p>
          <p className={"feedback-module-level text-body-2-compact"}>
            Competent
          </p>
        </div>
      </div>
      <div className="feedback-module-content">
        {module.topics.map((topic) => (
          <div key={topic.topicName} className={"module-topic-details"}>
            <span className={"module-topic-name text-body-2-compact-semi"}>
              {topic.topicName}
            </span>
            <span className={"skill-levels-scores text-body-2-compact-semi"}>
              {skillLevels.map((level) => (
                <span key={level.label} title={level.label}>
                  {level.score}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
