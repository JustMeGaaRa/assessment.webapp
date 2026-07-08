import { FC } from "react";
import "./AssessmentDetailsPage.css";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  AssessmentSessionStatistics,
  IndividualAssessmentStats,
} from "@lib/matrix";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AssessmentModuleDetails } from "@/components/ui/AssessmentModuleDetails";
import { AssessmentFeedbackCard } from "@/components/ui/AssessmentFeedbackCard";
import { ColorPalette } from "@/constants/colors";
import { LegendPanel } from "@/components/ui/LegendPanel";
import { Tag } from "@/components/ui/Tag";
// import { Avatar } from "@/components/ui/Avatar";
import {
  Calendar,
  Layers,
  PlusIcon,
  ShieldCheck,
  SparklesIcon,
} from "lucide-react";

export const AssessmentDetailsPage: FC<{
  status: "ongoing" | "completed";
  assessment: AssessmentSessionStatistics;
  feedbacks: IndividualAssessmentStats[];
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
              <div className={"assessment-details-score text-h1"}>
                {assessment.summary.totalScore.toFixed(1)}
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
                <div className={"assessment-details-proficiency text-h4"}>
                  {assessment.summary.proficiencyLevel}
                </div>
              )}
            </div>
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
            <div className={"assessment-feedback-panel"}>
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
                <Button variant={"accent"} leftIcon={<PlusIcon />}>
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
  );
};
