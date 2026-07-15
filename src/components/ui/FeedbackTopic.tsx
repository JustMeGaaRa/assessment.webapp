import "./FeedbackTopic.css";
import { FC, PropsWithChildren } from "react";
import { IndividualTopicScore, SkillLevel, TechnologyStack } from "@lib/matrix";
import Textarea from "./Textarea";
import { SkillLevelScore } from "./SkillLevelScore";

export const FeedbackTopic: FC<{
  topicScore: IndividualTopicScore;
  skillLevels: SkillLevel[];
  stack: TechnologyStack;
}> = ({ topicScore, skillLevels, stack }) => {
  return (
    <div className={"feedback-topic"}>
      <div className={"topic-details"}>
        <div className={"topic-details-block"}>
          <span className={"topic-name text-h5"}>{topicScore.topicName}</span>
          <span className={"topic-tech-description text-body-2-compact"}>
            {
              stack.topics.find((s) => s.topicId === topicScore.topicId)
                ?.technologyDescription
            }
          </span>
        </div>
        <div className={"skill-levels-value-list text-body-2-compact-semi"}>
          <ButtonGroup>
            {skillLevels.map((level) => (
              <SkillLevelScore
                key={level.label}
                level={level}
                selected={topicScore.score === level.score}
              />
            ))}
          </ButtonGroup>
        </div>
      </div>
      <Textarea
        className={"topic-notes"}
        rows={3}
        placeholder={"Your notes go here..."}
      />
    </div>
  );
};

export const ButtonGroup: FC<PropsWithChildren> = ({ children }) => {
  return <div className={"button-group"}>{children}</div>;
};
