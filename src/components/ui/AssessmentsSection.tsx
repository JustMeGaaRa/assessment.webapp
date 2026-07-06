import { FC } from "react";
import Link from "next/link";
import { AssessmentSession } from "@lib/matrix";
import "./AssessmentsSection.css";
import { ArrowUpRight } from "lucide-react";
import { Button } from "./Button";
import { AssessmentList } from "./AssessmentList";

export const AssessmentsSection: FC<{
  title: string;
  assessments: AssessmentSession[];
}> = ({ title, assessments }) => {
  return (
    <section className={"assessments-section"}>
      <div className={"container"}>
        <div className={"assessment-section-inner"}>
          <div className={"assessment-section-header"}>
            <h2 className={"assessments-section-title text-h2"}>{title}</h2>
            <Link href={"/assessments"}>
              <ArrowUpRight size={36} />
            </Link>
          </div>
          <AssessmentList assessments={assessments} />
          <Link href={"/assessments"}>
            <Button
              title={"See All"}
              className={"btn-see-all"}
              rightIcon={<ArrowUpRight />}
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
