import { AssessmentSession } from "@lib/matrix";
import { FC } from "react";
import "./AssessmentCard.css";
import Tag from "./Tag";
import { Calendar, Layers, ShieldCheck } from "lucide-react";

export const AssessmentCard: FC<{ assessment: AssessmentSession }> = ({
  assessment,
}) => {
  return (
    <div className={"assessment-card"}>
      <div className="assessment-card-header">
        <p className="assessment-card-title text-h4">
          {assessment.details.candidate.fullname}
        </p>
        <div className={"assessment-card-attribute"}>
          <Calendar size={16} className="text-slate-400" />
          <span className={"assessment-card-date text-body"}>
            {assessment.details.date.toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className={"assessment-card-content"}>
        <div className={"assessment-card-inner"}></div>
      </div>
      <div className={"assessment-card-footer"}>
        <div className={"tag-list"}>
          <Tag
            leadingIcon={<ShieldCheck size={16} className="text-slate-400" />}
          >
            {assessment.details.profile.title}
          </Tag>
          <Tag leadingIcon={<Layers size={16} className="text-slate-400" />}>
            {assessment.details.stack}
          </Tag>
        </div>
      </div>
    </div>
  );
};
