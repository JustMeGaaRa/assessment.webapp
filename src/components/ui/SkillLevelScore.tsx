import "./SkillLevelScore.css";
import { FC } from "react";
import { SkillLevel } from "@lib/matrix";

export const SkillLevelScore: FC<{ level: SkillLevel; selected?: boolean }> = ({
  level,
  selected,
}) => {
  return (
    <span
      key={level.label}
      title={level.label}
      className={"skill-level-value"}
      data-selected={selected}
    >
      {level.score}
    </span>
  );
};
