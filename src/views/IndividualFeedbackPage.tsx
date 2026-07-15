import "./IndividualFeedbackPage.css";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  AssessmentSession,
  IndividualAssessmentScore,
  SkillLevel,
  TechnologyStack,
} from "@lib/matrix";
import { FC } from "react";
import { FeedbackModuleDetails } from "@/components/ui/FeedbackModuleDetails";

export const IndividualFeedbackPage: FC<{
  assessment: AssessmentSession;
  feedback: IndividualAssessmentScore;
  stack: TechnologyStack;
  skillLevels: SkillLevel[];
}> = ({ assessment, feedback, stack, skillLevels }) => {
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
                  Score the proficiency within each topic
                </h3>
                <p className={"module-breakdown-description text-body"}>
                  Assign score for each topic within modules based on cadidates
                  knowledge and experience.
                </p>
              </div>
              <div className={"module-list"}>
                {feedback.modules.map((module) => (
                  <FeedbackModuleDetails
                    key={module.moduleId}
                    module={module}
                    stack={stack}
                    skillLevels={skillLevels}
                  />
                ))}
              </div>
            </div>
            <div className={"skill-cards-panel"}>
              <h3 className={"text-h3"}>Skill Levels</h3>
              <div className={"skill-card-list"}>
                {skillLevels.map((level) => (
                  <SkillLevelCard key={level.label} level={level} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkillLevelCard: FC<{
  level: SkillLevel;
}> = ({ level }) => {
  return (
    <div className={"skill-card"}>
      <p className={"skill-card-attribute-score text-body-2-compact-semi"}>
        LEVEL {level.score}
      </p>
      <p className={"skill-card-attribute-label text-h4"}>{level.label}</p>
      <p className={"skill-card-attribute-desc"}>{level.description}</p>
    </div>
  );
};
