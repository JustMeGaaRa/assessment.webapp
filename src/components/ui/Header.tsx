import { FC } from "react";
import "./Header.css";
import { Route } from "./Route";
import Link from "next/link";

export const Header: FC<{ heading: string }> = ({ heading }) => {
  return (
    <div className={"header-sticky"}>
      <div className={"container"}>
        <header className={"header"}>
          <Link href={"/home"}>
            <h1 className={"header-logo"}>{heading}</h1>
          </Link>
          <nav className={"header-nav"}>
            <Route label="Assessments" route="/assessments" active={false} />
            <Route label="Matrix" route="/matrix" active={false} />
          </nav>
          <div className={"header-right"}></div>
        </header>
      </div>
    </div>
  );
};
