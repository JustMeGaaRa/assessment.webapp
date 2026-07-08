import { IndividualAssessmentStats } from "@lib/matrix";
import { ArrowUpRight, Calendar } from "lucide-react";
import { FC } from "react";
import "./AssessmentFeedbackCard.css";
import { UiKitColor } from "@/constants/colors";
import { Avatar } from "./Avatar";

export const AssessmentFeedbackCard: FC<{
  feedback: IndividualAssessmentStats;
  avatarColor?: UiKitColor;
}> = ({ feedback, avatarColor = "gray" }) => {
  return (
    <div className={"feedback-card"}>
      <div className={"feedback-card-row"}>
        <Avatar label={feedback.assessor.fullname} colorPalette={avatarColor} />
        <ArrowUpRight size={32} />
      </div>
      <div className={"feedback-card-row"}>
        <div className={"feedback-card-info"}>
          <span className={"feedback-assessor-fullname text-h4"}>
            {feedback.assessor.fullname}
          </span>
          <span className={"feedback-date text-body-2-compact"}>
            <Calendar size={12} />
            {(feedback.date ?? new Date()).toLocaleDateString()}
          </span>
        </div>
        <div className={"feedback-card-score"}>
          <p className={"feedback-score text-h2"}>
            {feedback.stats.weightedScore.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};
