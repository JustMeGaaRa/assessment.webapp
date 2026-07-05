import { FC } from "react";
import "./StatisticsSection.css";

export const StatisticsSection: FC<{
  title: string;
  assessmentStats: {
    total: number;
    monthly: number;
    experts: number;
  };
}> = ({ title, assessmentStats }) => {
  return (
    <section className={"statistics-section"}>
      <div className={"container"}>
        <div className={"statistics-inner"}>
          <h2 className={"statistics-section-title text-h2"}>{title}</h2>

          <div className={"statistics-list"}>
            <StatCard
              span={2}
              title={"Total assessments"}
              value={assessmentStats.total}
            />
            <StatCard
              title={"Experts involved"}
              value={assessmentStats.experts}
            />
            {/* <StatCard
              title="Proficiency level breakdown"
              value={<ProficiencyLevelBar
                proficiencyLevel={assessmentStats.proficiencyLevel}
              />}
            /> */}
            <StatCard title={"This month"} value={assessmentStats.monthly} />
            <StatCard span={2} title={"Proficiency levels"} value={3} />
          </div>
        </div>
      </div>
    </section>
  );
};

export const StatCard: FC<{
  title: string;
  value: string | React.ReactNode;
  span?: 1 | 2 | 3;
}> = ({ title, value, span }) => {
  return (
    <div className={`statistic-card span-${span}`}>
      <div className={"statistic-card-inner"}>
        <div className={"statistic-card-title text-h5"}>{title}</div>
        <div className={"statistic-card-value text-h1"}>{value}</div>
      </div>
    </div>
  );
};
