import { FC } from "react";
import "./AssessmentsPage.css";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AssessmentSession } from "@lib/matrix";
// import { Button } from "@/components/ui/Button";
import { AssessmentList } from "@/components/ui/AssessmentList";

export const AssessmentsPage: FC<{ assessments: Array<AssessmentSession> }> = ({
  assessments,
}) => {
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
