import { FC } from "react";
import "./StatisticsSection.css";
import { Calendar, TrendingUp, Trophy, UserCheck } from "lucide-react";

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
              icon={<TrendingUp />}
            />
            <StatCard
              title={"Experts involved"}
              value={assessmentStats.experts}
              icon={<UserCheck />}
            />
            <StatCard
              title={"This month"}
              value={assessmentStats.monthly}
              icon={<Calendar />}
            />
            <StatCard
              span={2}
              title={"Proficiency levels"}
              value={3}
              icon={<Trophy />}
            />
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
  icon?: React.ReactNode;
}> = ({ title, value, span = 1, icon }) => {
  return (
    <div className={`statistic-card span-${span}`}>
      <div className={"statistic-card-icon"}>{icon}</div>
      <div className={"statistic-card-value text-h1"}>{value}</div>
      <div className={"statistic-card-title text-h5"}>{title}</div>
    </div>
  );
};
