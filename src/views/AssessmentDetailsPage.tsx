import { FC } from "react";
import "./AssessmentDetailsPage.css";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AssessmentSession } from "@lib/matrix";

export const AssessmentDetailsPage: FC<{ assessment: AssessmentSession }> = ({
  assessment,
}) => {
  return (
    <div className={"assessment-details-page"}>
      <div className={"assessment-details-heading"}>
        <div className={"container"}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/home" },
              { label: "Assessments", href: "/assessments" },
              { label: assessment.details.candidate.fullname },
            ]}
          />
          <h1 className={"assessment-details-title text-h1"}>
            {assessment.details.candidate.fullname}
          </h1>
        </div>
      </div>
      <section className={"assessment-details"}>
        <div className={"container"}>Assessment details</div>
      </section>
    </div>
  );
};
