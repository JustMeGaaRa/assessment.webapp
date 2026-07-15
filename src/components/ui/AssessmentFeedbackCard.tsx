import "./AssessmentFeedbackCard.css";
import { ArrowUpRight } from "lucide-react";
import { FC } from "react";
import { IndividualAssessmentScoreWithProgress } from "@lib/matrix";
import { UiKitColor } from "@/constants/colors";
import { Avatar } from "./Avatar";

export const AssessmentFeedbackCard: FC<{
  feedback: IndividualAssessmentScoreWithProgress;
  avatarColor?: UiKitColor;
}> = ({ feedback, avatarColor = "gray" }) => {
  const isCompleted = feedback.status === "completed";
  const percentage = Math.round(
    (feedback.progress.completedTopics / feedback.progress.totalTopics) * 100,
  );

  return (
    <div className={"feedback-card"}>
      <div className={"feedback-card-row align-top"}>
        <Avatar label={feedback.assessor.fullname} colorPalette={avatarColor} />
        <ArrowUpRight size={24} />
      </div>
      <div className={"feedback-card-row align-bottom"}>
        <span className={"feedback-assessor-fullname text-h4"}>
          {feedback.assessor.fullname}
        </span>
        <div className={"feedback-score"}>
          <span className={"text-h2"}>
            {isCompleted
              ? feedback.statistics.weightedScore.toFixed(1)
              : percentage}
          </span>
          <span
            className={"text-body-compact"}
            style={{ color: "var(--gray-text)" }}
          >
            {isCompleted ? "/5" : "%"}
          </span>
        </div>
      </div>
      <div className={"feedback-card-row align-bottom"}>
        <span className={"feedback-field-date"}>
          <span className={"text-body-2-compact-semi"}>
            {isCompleted ? "Completed" : "Started"}
          </span>
          <span className={"text-body-2-compact"}>
            {(feedback.date ?? new Date()).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </span>
        <span
          className={"feedback-card-attribute-level text-body-2-compact-semi"}
        >
          {isCompleted ? feedback.statistics.proficiencyLevel : "Progress"}
        </span>
      </div>
    </div>
  );
};
