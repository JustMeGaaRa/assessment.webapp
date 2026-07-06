import { FC } from "react";
import "./HomePage.css";
import { AssessmentSession } from "@lib/matrix";
import { AssessmentsSection } from "@/components/ui/AssessmentsSection";
import { StatisticsSection } from "@/components/ui/StatisticsSection";

interface AssessmentStats {
  total: number;
  monthly: number;
  experts: number;
}

export const HomePage: FC<{
  recentAssessments: Array<AssessmentSession>;
  assessmentStats: AssessmentStats;
}> = ({ recentAssessments, assessmentStats }) => {
  return (
    <div className={"home-page"}>
      <StatisticsSection
        title={"Explore the numbers"}
        assessmentStats={assessmentStats}
      />
      <AssessmentsSection
        title={"Jump back into recent assessments"}
        assessments={recentAssessments}
      />
    </div>
  );
};
