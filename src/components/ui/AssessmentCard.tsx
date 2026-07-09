import "./AssessmentCard.css";
import { ArrowUpRight } from "lucide-react";
import { FC } from "react";
import { AssessmentSessionWithProgress } from "@lib/matrix";

export const AssessmentCard: FC<{
  assessment: AssessmentSessionWithProgress;
}> = ({ assessment }) => {
  const isCompleted = assessment.progress.status === "completed";

  return (
    <div className={"assessment-card"}>
      <div className={"assessment-card-inner"}>
        <div className={"assessment-card-header"}>
          <div className={"tag-list"}>
            <span className={"assessment-tag text-body-2-compact-semi"}>
              {assessment.details.profile.title}
            </span>
            <span
              style={{
                height: "4px",
                width: "4px",
                backgroundColor: "var(--gray-text)",
              }}
            ></span>
            <span className={"assessment-tag text-body-2-compact-semi"}>
              {assessment.details.stack}
            </span>
          </div>
          <ArrowUpRight size={24} />
        </div>
        <div className={"assessment-card-content"}>
          <div className={"assessment-card-row bottom"}>
            <span className={"assessment-card-title text-h4"}>
              {assessment.details.candidate.fullname}
            </span>
            <span className={"assessment-field-score"}>
              <span
                className={"text-h2"}
                style={{
                  color: isCompleted ? "var(--brand-500)" : "var(--dark)",
                }}
              >
                {isCompleted
                  ? assessment.summary.totalScore.toFixed(1)
                  : assessment.progress.completedFeedbacks}
              </span>
              <span className={"text-body-2-compact"}>
                /{isCompleted ? 5 : assessment.progress.totalFeedbacks}
              </span>
            </span>
          </div>
          <div className={"assessment-card-row bottom"}>
            <span className={"assessment-field-date"}>
              <span className={"text-body-2-compact-semi"}>
                {isCompleted ? "Completed" : "Started"}
              </span>
              <span className={"text-body-2-compact"}>
                {assessment.details.date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
            <span
              className={
                "assessment-field-proficiency text-body-2-compact-semi"
              }
              style={{
                color: isCompleted ? "var(--brand-500)" : "var(--gray-text)",
              }}
            >
              {isCompleted ? assessment.summary.proficiencyLevel : "Feedbacks"}
            </span>
          </div>
        </div>
      </div>
      {/* <ProgressIndicator
        min={0}
        max={progress.totalFeedbacks}
        value={progress.completedFeedbacks}
        fill={isCompleted ? "brand" : "yellow"}
        height={"8px"}
      /> */}
    </div>
  );
};
