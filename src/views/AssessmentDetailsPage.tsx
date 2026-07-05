import { FC } from "react";
import "./AssessmentDetailsPage.css";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  AssessmentModuleStatistics,
  AssessmentSessionStatistics,
  IndividualAssessmentScore,
} from "@lib/matrix";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const AssessmentDetailsPage: FC<{
  assessment: AssessmentSessionStatistics;
  feedbacks: IndividualAssessmentScore[];
}> = ({ assessment, feedbacks }) => {
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
                {assessment.modules.map((module) => (
                  <AssessmentModuleDetails
                    key={module.moduleId}
                    module={module}
                  />
                ))}
              </div>
              <div className={"separator"} />
              <div className={"assessment-feedback-list"}>
                <h4 className="text-h4">Feedbacks</h4>
                {feedbacks.map((feedback) => (
                  <AssessmentFeedbackCard
                    key={feedback.feedbackId}
                    assessmentId={assessment.assessmentId}
                    feedback={feedback}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const AssessmentModuleDetails: FC<{
  module: AssessmentModuleStatistics;
}> = ({ module }) => {
  return (
    <div className={"assessment-module"}>
      <div className="assessment-module-header">
        <div className={"assessment-module-header-left"}>
          <p className={"text-h5"}>{module.moduleName}</p>
          <p className={"text-body-compact"}>{module.description}</p>
        </div>
        <div className="assessment-module-header-right">
          <p className={"text-h5"}>{module.stats.averageScore}</p>
          <p className={"text-body-compact"}>Competent</p>
        </div>
      </div>
      <div className="assessment-module-content"></div>
    </div>
  );
};

export const AssessmentFeedbackCard: FC<{
  assessmentId: string;
  feedback: IndividualAssessmentScore;
}> = ({ assessmentId, feedback }) => {
  return (
    <div className={"feedback-card"}>
      <div className={"feedback-card-content"}>
        <div className={"feedback-card-avatar"}>PH</div>
        <div className={"feedback-card-info"}>
          <p className={"text-h5"}>{feedback.assessor.fullname}</p>
          <p className={"text-body-compact"}>
            {(feedback.date ?? new Date()).toLocaleDateString()}
          </p>
        </div>
        <div className={"feedback-card-score"}>
          <p className={"text-h4"}>{"3.5"}</p>
        </div>
      </div>
      <div className={"feedback-card-footer"}>
        <div className={"feedback-card-actions"}>
          <Link
            href={`assessments/${assessmentId}/feedbacks/${feedback.feedbackId}`}
          >
            Edit Feedback
          </Link>
          <ArrowUpRight />
        </div>
      </div>
    </div>
  );
};
