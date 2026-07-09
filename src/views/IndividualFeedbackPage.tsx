import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  AssessmentSession,
  IndividualAssessmentScore,
  SkillLevel,
} from "@lib/matrix";
import { FC } from "react";
import "./IndividualFeedbackPage.css";
import { IndividualFeedbackModuleDetails } from "@/components/ui/AssessmentModuleDetails";

export const IndividualFeedbackPage: FC<{
  assessment: AssessmentSession;
  feedback: IndividualAssessmentScore;
  skillLevels: SkillLevel[];
}> = ({ assessment, feedback, skillLevels }) => {
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
          <div className={"individual-feedback-header"}></div>
          <div className={"individual-feedback-content"}>
            <div className={"module-breakdown"}>
              <div className={"module-breakdown-heading"}>
                <h3 className={"module-breakdown-title text-h3"}>
                  Score the performence for each module
                </h3>
                <p className={"module-breakdown-description text-body"}>
                  Assign score for each topic within modules based on cadidates
                  knowledge and experience.
                </p>
              </div>
              <div className={"module-list"}>
                {feedback.modules.map((module) => (
                  <IndividualFeedbackModuleDetails
                    key={module.moduleId}
                    module={module}
                  />
                ))}
              </div>
            </div>
            <div className={"skill-levels-panel"}>
              <h3 className={"text-h3"}>Skill Levels</h3>
              <div className={"skill-levels-list"}>
                {skillLevels.map((skillLevel) => (
                  <div key={skillLevel.label}>{skillLevel.label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
