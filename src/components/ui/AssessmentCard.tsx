import { AssessmentSession } from "@lib/matrix";
import { FC } from "react";
import "./AssessmentCard.css";

export const AssessmentCard: FC<{ assessment: AssessmentSession }> = ({
  assessment,
}) => {
  return (
    <div className={"assessment-card"}>
      <div className="assessment-card-header">
        <h2 className="assessment-card-title text-h3">
          {assessment.details.candidate.fullname}
        </h2>
        <span className={"text-body"}>
          {assessment.details.date.toLocaleDateString()}
        </span>
      </div>
      <div className={"assessment-card-content"}>
        <div className={"assessment-card-inner"}>
          <span className={"text-body"}>
            {assessment.details.profile.title}
          </span>
          <span className={"text-body"}>{assessment.details.stack}</span>
        </div>
      </div>
      <div className={"assessment-card-footer"}></div>
    </div>
  );
};
