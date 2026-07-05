import { FC, PropsWithChildren } from "react";
import Link from "next/link";
import { AssessmentCard } from "./AssessmentCard";
import { AssessmentSession } from "@lib/matrix";
import "./AssessmentsSection.css";

export const AssessmentsSection: FC<
  PropsWithChildren<{
    title: string;
    assessments: AssessmentSession[];
  }>
> = ({ children, title, assessments }) => {
  return (
    <section className={"assessments-section"}>
      <div className={"container"}>
        <div className={"assessment-session-inner"}>
          <h2 className={"assessments-section-title text-h2"}>{title}</h2>

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
          {children}
        </div>
      </div>
    </section>
  );
};
