import { AssessmentSession } from "@lib/matrix";
import { FC } from "react";
import "./AssessmentCard.css";
import { Tag } from "./Tag";
import { ArrowUpRight, Calendar, Layers, ShieldCheck } from "lucide-react";
import { Badge } from "./Badge";

export const AssessmentCard: FC<{ assessment: AssessmentSession }> = ({
  assessment,
}) => {
  const status = assessment.feedbacks.every((f) => f.status === "completed")
    ? "completed"
    : "ongoing";
  return (
    <div className={"assessment-card"}>
      <div className={"assessment-card-content"}>
        <Badge
          label={status}
          colorPalette={status === "completed" ? "brand" : "yellow"}
        />
        <ArrowUpRight size={32} />
      </div>
      <div className="assessment-card-header">
        <p className="assessment-card-title text-h4">
          {assessment.details.candidate.fullname}
        </p>
        <div className={"assessment-card-attribute"}>
          <Calendar size={16} />
          <span className={"assessment-card-date text-body"}>
            {assessment.details.date.toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className={"assessment-card-footer"}>
        <div className={"tag-list"}>
          <Tag leadingIcon={<ShieldCheck size={16} />}>
            {assessment.details.profile.title}
          </Tag>
          <Tag leadingIcon={<Layers size={16} />}>
            {assessment.details.stack}
          </Tag>
        </div>
      </div>
    </div>
  );
};
