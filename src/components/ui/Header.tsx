import { FC } from "react";
import "./Header.css";
import { Route } from "./Route";
import { Button } from "./Button";

export const Header: FC<{ heading: string }> = ({ heading }) => {
  return (
    <div className={"header-sticky"}>
      <div className={"container"}>
        <header className={"header"}>
          <a href={"/home"}>
            <h1 className={"header-logo"}>{heading}</h1>
          </a>
          <nav className={"header-nav"}>
            <Route label="Assessments" route="/assessments" active={false} />
            <Route label="Matrix" route="/matrix" active={false} />
          </nav>
          <div className={"header-actions"}>
            <Button title={"New assessment"} variant={"primary"} />
          </div>
        </header>
      </div>
    </div>
  );
};
