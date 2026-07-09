import "./AssessmentsPage.css";
import { FC } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AssessmentList } from "@/components/ui/AssessmentList";
import { AssessmentSessionWithProgress } from "@lib/matrix";
// import { Button } from "@/components/ui/Button";

export const AssessmentsPage: FC<{
  assessments: Array<AssessmentSessionWithProgress>;
}> = ({ assessments }) => {
  return (
    <div className={"assessments-page"}>
      <div className={"container"}>
        <div className={"assessment-page-inner"}>
          <Breadcrumb
            items={[{ label: "Home", href: "/home" }, { label: "Assessments" }]}
          />
          <div className={"assessment-page-header"}>
            <div className={"assessment-page-header-title"}>
              <h2 className={"text-h2"}>Assessments</h2>
            </div>
            <div className={"assessment-page-header-actions"}>
              {/* <Button title={"New assessment"} variant={"primary"} /> */}
            </div>
          </div>

          <AssessmentList assessments={assessments} />
        </div>
      </div>
    </div>
  );
};
