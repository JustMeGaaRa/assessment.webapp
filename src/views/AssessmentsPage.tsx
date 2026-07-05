import { FC } from "react";
import "./AssessmentsPage.css";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AssessmentSession } from "@lib/matrix";
import { AssessmentsSection } from "@/components/ui/AssessmentsSection";

export const AssessmentsPage: FC<{ assessments: Array<AssessmentSession> }> = ({
  assessments,
}) => {
  return (
    <div className={"assessments-page"}>
      <div className={"container"}>
        <Breadcrumb
          items={[{ label: "Home", href: "/home" }, { label: "Assessments" }]}
        />
      </div>

      <AssessmentsSection title={"Assessments"} assessments={assessments} />
    </div>
  );
};
