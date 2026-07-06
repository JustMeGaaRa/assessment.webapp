import { IndividualAssessmentScore } from "@lib/matrix";
import { ArrowUpRight } from "lucide-react";
import { FC } from "react";
import "./AssessmentFeedbackCard.css";
import { UiKitColor } from "@/constants/colors";

export const AssessmentFeedbackCard: FC<{
  feedback: IndividualAssessmentScore;
  avatarColor?: UiKitColor;
}> = ({ feedback, avatarColor = "gray" }) => {
  return (
    <div className={"feedback-card"}>
      <div className={"feedback-card-row"}>
        <div
          className={"feedback-card-avatar"}
          style={{ backgroundColor: `var(--${avatarColor}-400)` }}
        >
          {feedback.assessor.fullname
            .trim()
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </div>
        <div className={"feedback-card-actions"}>
          <ArrowUpRight size={32} />
        </div>
      </div>
      <div className={"feedback-card-row"}>
        <div className={"feedback-card-info"}>
          <p className={"feedback-assessor-fullname text-h4"}>
            {feedback.assessor.fullname}
          </p>
          <p className={"feedback-date text-body-2-compact"}>
            {(feedback.date ?? new Date()).toLocaleDateString()}
          </p>
        </div>
        <div className={"feedback-card-score"}>
          <p className={"feedback-score text-h2"}>{"3.5"}</p>
        </div>
      </div>
    </div>
  );
};
