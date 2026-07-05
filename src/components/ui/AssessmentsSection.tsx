import { FC } from "react";
import Link from "next/link";
import { AssessmentCard } from "./AssessmentCard";
import { AssessmentSession } from "@lib/matrix";
import "./AssessmentsSection.css";

export const AssessmentsSection: FC<{
  title: string;
  assessments: AssessmentSession[];
}> = ({ title, assessments }) => {
  return (
    <section className={"assessments-section"}>
      <div className={"container"}>
        <div className={"assessment-session-inner"}>
          <h1 className={"assessments-section-title text-h1"}>{title}</h1>

          <div className={"assessment-list"}>
            {assessments.slice(0, 6).map((assessment) => (
              <Link
                key={assessment.assessmentId}
                className={"assessment-card-link"}
                href={`/assessments/${assessment.assessmentId}`}
              >
                <AssessmentCard assessment={assessment} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
