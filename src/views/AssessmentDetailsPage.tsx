import "./AssessmentDetailsPage.css";
import Link from "next/link";
import {
  Calendar,
  Layers,
  PlusIcon,
  ShieldCheck,
  SparklesIcon,
} from "lucide-react";
import { FC } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { AssessmentModuleDetails } from "@/components/ui/AssessmentModuleDetails";
import { AssessmentFeedbackCard } from "@/components/ui/AssessmentFeedbackCard";
import { ColorPalette } from "@/constants/colors";
import { LegendPanel } from "@/components/ui/LegendPanel";
import { Tag } from "@/components/ui/Tag";
import {
  AssessmentSessionWithProgress,
  IndividualAssessmentScoreWithProgress,
} from "@lib/matrix";

export const AssessmentDetailsPage: FC<{
  assessment: AssessmentSessionWithProgress;
  feedbacks: IndividualAssessmentScoreWithProgress[];
}> = ({ assessment, feedbacks }) => {
  const isCompleted = assessment.progress.status === "completed";

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
          <div className={"assessment-details-header"}>
            {/* <div style={{ height: "108px", aspectRatio: "1/1" }}>
              <Avatar
                label={assessment.details.candidate.fullname}
                colorPalette={"gray"}
              />
            </div> */}
            <div className={"assessment-details-row"}>
              <div className={"assessment-details-info"}>
                <h2 className={"assessment-details-title text-h2"}>
                  {assessment.details.candidate.fullname}
                </h2>
                <span className={"assessment-details-date text-body"}>
                  <Calendar size={16} />
                  {assessment.details.date.toLocaleDateString()}
                </span>
              </div>
              <div className={"assessment-details-score"}>
                <span
                  className={"text-h1"}
                  style={{
                    color: isCompleted ? "var(--brand-500)" : "var(--dark)",
                    fontSize: "5rem",
                    lineHeight: "64px",
                  }}
                >
                  {isCompleted
                    ? assessment.summary.totalScore.toFixed(1)
                    : assessment.progress.completedFeedbacks}
                </span>
                <span
                  className={"text-h3"}
                  style={{ color: "var(--gray-text)" }}
                >
                  /{isCompleted ? 5 : assessment.progress.totalFeedbacks}
                </span>
              </div>
            </div>
            <div className={"assessment-details-row"}>
              <div className={"assessment-details-tags"}>
                <Tag leadingIcon={<Layers size={16} />}>
                  {assessment.details.stack}
                </Tag>
                <Tag leadingIcon={<ShieldCheck size={16} />}>
                  {assessment.details.profile.title}
                </Tag>
              </div>
              {assessment.summary.proficiencyLevel && (
                <div
                  className={"assessment-details-proficiency text-h4"}
                  style={{
                    color: isCompleted
                      ? "var(--brand-500)"
                      : "var(--gray-text)",
                  }}
                >
                  {isCompleted
                    ? assessment.summary.proficiencyLevel
                    : "Feedbacks"}
                </div>
              )}
            </div>
          </div>
          <div className={"assessment-details-content"}>
            <div className={"assessment-module-breakdown"}>
              <div className={"assessment-module-breakdown-heading"}>
                <h3 className="assessment-module-breakdown-title text-h3">
                  Review the performance for each module
                </h3>
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
            <div className={"assessment-feedback-panel"}>
              <h3 className="text-h3">Feedbacks</h3>
              <div className={"assessment-feedback-list"}>
                {feedbacks.map((feedback, index) => (
                  <Link
                    key={feedback.feedbackId}
                    href={`/assessments/${assessment.assessmentId}/feedbacks/${feedback.feedbackId}`}
                  >
                    <AssessmentFeedbackCard
                      feedback={feedback}
                      avatarColor={ColorPalette[index % ColorPalette.length]}
                    />
                  </Link>
                ))}
                <div className={"assessment-feedback-actions"}>
                  <Button variant={"primary"} leftIcon={<PlusIcon />}>
                    Add expert feedback
                  </Button>
                  <Button variant={"secondary"} leftIcon={<SparklesIcon />}>
                    Generate AI feedback
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
