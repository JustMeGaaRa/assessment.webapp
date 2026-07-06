import Link from "next/link";
import { AssessmentCard } from "./AssessmentCard";
import { AssessmentSession } from "@lib/matrix";
import { FC } from "react";
import "./AssessmentList.css";

export const AssessmentList: FC<{
  assessments: AssessmentSession[];
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
