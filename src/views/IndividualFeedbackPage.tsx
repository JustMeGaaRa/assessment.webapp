import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AssessmentSession, IndividualAssessmentScore } from "@lib/matrix";
import { FC } from "react";
import "./IndividualFeedbackPage.css";

export const IndividualFeedbackPage: FC<{
  assessment: AssessmentSession;
  feedback: IndividualAssessmentScore;
}> = ({ assessment, feedback }) => {
  return (
    <div className={"individual-feedback-page"}>
      <div className={"container"}>
        <div className={"individual-feedback-inner"}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/home" },
              { label: "Assessments", href: "/assessments" },
              {
                label: assessment.details.candidate.fullname,
                href: `/assessments/${assessment.assessmentId}`,
              },
              { label: "Feedbacks" },
              { label: feedback.assessor.fullname },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
