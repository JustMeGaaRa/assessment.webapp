import "./SkillLevelCard.css";
import { FC } from "react";
import { SkillLevel } from "@lib/matrix";

export const SkillLevelCard: FC<{
  level: SkillLevel;
}> = ({ level }) => {
  return (
    <div className={"skill-card"}>
      <p className={"skill-card-attribute-score text-body-2-compact-semi"}>
        LEVEL {level.score}
      </p>
      <p className={"skill-card-attribute-label text-h4"}>{level.label}</p>
      <p className={"skill-card-attribute-desc"}>{level.description}</p>
    </div>
  );
};
