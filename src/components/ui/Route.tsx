import { FC } from "react";
import Link from "next/link";
import "./Route.css";

export const Route: FC<{ label: string; route: string; active: boolean }> = ({
  label,
  route,
  active,
}) => {
  return (
    <Link href={route} className={"route"}>
      <span className={"route-label"}>{label}</span>
      {active && <span className={"route-active"}></span>}
    </Link>
  );
};
