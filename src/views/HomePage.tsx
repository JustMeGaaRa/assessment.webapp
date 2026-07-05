import { FC } from "react";
import "./HomePage.css";
import Link from "next/link";
import { AssessmentSession } from "@lib/matrix";
import { Button } from "@/components/ui/Button";
import { AssessmentsSection } from "@/components/ui/AssessmentsSection";

export const HomePage: FC<{ assessments: Array<AssessmentSession> }> = ({
  assessments,
}) => {
  return (
    <div className={"home-page"}>
      <div className={"recent-assessments"}>
        <AssessmentsSection
          title={"Recent Assessments"}
          assessments={assessments.slice(0, 6)}
        />
        <div className={"container"}>
          <Link href={"/assessments"}>
            <Button title={"See All"} />
          </Link>
        </div>
      </div>
    </div>
  );
};
