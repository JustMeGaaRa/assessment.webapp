import "./AssessmentList.css";
import Link from "next/link";
import { FC } from "react";
import { AssessmentCard } from "./AssessmentCard";
import { AssessmentSessionWithProgress } from "@lib/matrix";

export const AssessmentList: FC<{
  assessments: AssessmentSessionWithProgress[];
}> = ({ assessments }) => {
  return (
    <div className={"assessment-list"}>
      {assessments.map((assessment) => (
        <Link
          key={assessment.assessmentId}
          className={"assessment-card-link"}
          href={`/assessments/${assessment.assessmentId}`}
        >
          <AssessmentCard assessment={assessment} />
        </Link>
      ))}
    </div>
  );
};
