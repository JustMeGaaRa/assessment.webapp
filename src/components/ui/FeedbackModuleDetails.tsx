import "./FeedbackModuleDetails.css";
import {
  IndividualModuleScore,
  SkillLevel,
  TechnologyStack,
} from "@lib/matrix";
import { FC } from "react";
import { FeedbackTopic } from "./FeedbackTopic";

export const FeedbackModuleDetails: FC<{
  module: IndividualModuleScore;
  stack: TechnologyStack;
  skillLevels: SkillLevel[];
}> = ({ module, stack, skillLevels }) => {
  return (
    <div className={"feedback-module"}>
      <div className="feedback-module-header">
        <div className={"feedback-module-header-left"}>
          <p className={"feedback-module-name text-h4"}>{module.moduleName}</p>
          <p className={"feedback-module-description text-body-2-compact"}>
            {module.description}
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
          <FeedbackTopic
            key={topic.topicName}
            topicScore={topic}
            skillLevels={skillLevels}
            stack={stack}
          />
        ))}
      </div>
    </div>
  );
};
