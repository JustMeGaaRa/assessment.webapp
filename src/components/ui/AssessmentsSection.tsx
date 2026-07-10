import "./AssessmentsSection.css";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FC } from "react";
import { Button } from "./Button";
import { AssessmentList } from "./AssessmentList";
import { AssessmentSessionWithProgress } from "@lib/matrix";

export const AssessmentsSection: FC<{
  title: string;
  assessments: AssessmentSessionWithProgress[];
}> = ({ title, assessments }) => {
  return (
    <section className={"assessments-section"}>
      <div className={"container"}>
        <div className={"assessment-section-inner"}>
          <div className={"assessment-section-header"}>
            <h2 className={"assessments-section-title text-h2"}>{title}</h2>
          </div>
          <AssessmentList assessments={assessments} />
          <Link href={"/assessments"}>
            <Button
              variant={"primary"}
              className={"btn-see-all"}
              rightIcon={<ArrowUpRight />}
            >
              See All
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
