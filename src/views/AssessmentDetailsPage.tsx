import { FC } from "react";
import "./AssessmentDetailsPage.css";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  AssessmentSessionStatistics,
  IndividualAssessmentScore,
} from "@lib/matrix";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AssessmentModuleDetails } from "@/components/ui/AssessmentModuleDetails";
import { AssessmentFeedbackCard } from "@/components/ui/AssessmentFeedbackCard";
import { ColorPalette, UiKitColor } from "@/constants/colors";

export const AssessmentDetailsPage: FC<{
  assessment: AssessmentSessionStatistics;
  feedbacks: IndividualAssessmentScore[];
}> = ({ assessment, feedbacks }) => {
  return (
    <div className={"assessment-details-page"}>
      <div className={"container"}>
        <div className={"assessment-details-inner"}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/home" },
              { label: "Assessments", href: "/assessments" },
              { label: assessment.details.candidate.fullname },
            ]}
          />
          <div className={"assessment-details-info"}>
            <h2 className={"assessment-details-title text-h2"}>
              {assessment.details.candidate.fullname}
            </h2>
          </div>
          <div className={"assessment-details-content"}>
            <div className={"assessment-module-breakdown"}>
              <div className={"assessment-module-breakdown-heading"}>
                <h4 className="assessment-module-breakdown-title text-h3">
                  Modules breakdown
                </h4>
                <p
                  className={
                    "assessment-module-breakdown-description text-body"
                  }
                >
                  Each module scored 1–5, compared across every feedback source.
                </p>
              </div>
              <LegendPanel
                items={feedbacks.map((feedback, index) => ({
                  color: ColorPalette[index % ColorPalette.length],
                  label: feedback.assessor.fullname,
                }))}
              />
              <div className={"assessment-module-list"}>
                {assessment.modules.map((module) => (
                  <AssessmentModuleDetails
                    key={module.moduleId}
                    module={module}
                  />
                ))}
              </div>
            </div>
            <div className={"assessment-feedback-sidebar"}>
              <h4 className="text-h3">Feedbacks</h4>
              <div className={"assessment-feedback-list"}>
                {feedbacks.map((feedback, index) => (
                  <Link
                    href={`assessments/${assessment.assessmentId}/feedbacks/${feedback.feedbackId}`}
                  >
                    <AssessmentFeedbackCard
                      key={feedback.feedbackId}
                      feedback={feedback}
                      avatarColor={ColorPalette[index % ColorPalette.length]}
                    />
                  </Link>
                ))}
                <Button title={"Create feedback"} variant={"primary"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LegendPanel: FC<{
  items: Array<{ color: UiKitColor; label: string }>;
}> = ({ items }) => {
  return (
    <div className={"legend-panel"}>
      {items.map(({ color, label }, index) => (
        <div className={"legend-item"} key={index}>
          <div
            className={"legend-item-color"}
            style={{
              backgroundColor: `var(--${color}-400)`,
            }}
          />
          <span className={"legend-item-text text-body-2-compact-semi"}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};
