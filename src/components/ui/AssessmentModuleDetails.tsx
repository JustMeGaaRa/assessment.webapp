import { AssessmentModuleStatistics } from "@lib/matrix";
import { FC } from "react";
import "./AssessmentModuleDetails.css";
import { ColorPalette } from "@/constants/colors";
import { ProgressIndicator } from "./ProgressIndicator";

export const AssessmentModuleDetails: FC<{
  module: AssessmentModuleStatistics;
}> = ({ module }) => {
  return (
    <div className={"assessment-module"}>
      <div className="assessment-module-header">
        <div className={"assessment-module-header-left"}>
          <p className={"assessment-module-name text-h4"}>
            {module.moduleName}
          </p>
          <p className={"assessment-module-description text-body-2-compact"}>
            {module.description}
          </p>
        </div>
        <div className="assessment-module-header-right">
          <p className={"text-h4"}>{module.stats.averageScore.toFixed(1)}</p>
          <p className={"assessment-module-level text-body-2-compact"}>
            Competent
          </p>
        </div>
      </div>
      <div className="assessment-module-content">
        {module.assessorStats.map((assessorStat, index) => (
          <div className={"assessor-stat-row"}>
            <span
              className={"assessor-stat-fullname text-body-2-compact-semi"}
              title={assessorStat.assessor.fullname}
            >
              {assessorStat.assessor.fullname}
            </span>
            <ProgressIndicator
              min={0}
              max={5}
              value={assessorStat.module.averageScore}
              fill={ColorPalette[index % ColorPalette.length]}
            />
            <span className={"text-body-2-compact-semi"}>
              {assessorStat.module.averageScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
