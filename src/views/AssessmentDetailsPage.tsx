import { FC } from "react";
import "./AssessmentDetailsPage.css";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AssessmentSession } from "@lib/matrix";

export const AssessmentDetailsPage: FC<{ assessment: AssessmentSession }> = ({
  assessment,
}) => {
  return (
    <div className={"assessment-details-page"}>
      <div className={"container"}>
        <Breadcrumb
          items={[
            { label: "Home", href: "/home" },
            { label: "Assessments", href: "/assessments" },
            { label: assessment.details.candidate.fullname },
          ]}
        />
      </div>
      <section className={"assessment-details"}>
        <div className={"container"}>
          <div className={"assessment-details-inner"}>
            <h2 className={"assessment-details-title text-h2"}>
              {assessment.details.candidate.fullname}
            </h2>
            <div className={"assessment-details-content"}>
              <div className={"assessment-module-breakdown"}>
                <h4 className="text-h4">Modules breakdown</h4>
              </div>
              <div className={"assessment-feedback-list"}>
                <h4 className="text-h4">Feedbacks</h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
