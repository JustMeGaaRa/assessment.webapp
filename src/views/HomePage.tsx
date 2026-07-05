import { FC } from "react";
import "./HomePage.css";
import Link from "next/link";
import { AssessmentSession } from "@lib/matrix";
import { Button } from "@/components/ui/Button";
import { AssessmentsSection } from "@/components/ui/AssessmentsSection";
import { ArrowUpRight } from "lucide-react";
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
      >
        <Link href={"/assessments"}>
          <Button
            title={"See All"}
            className={"btn-see-all"}
            rightIcon={<ArrowUpRight />}
          />
        </Link>
      </AssessmentsSection>
    </div>
  );
};
