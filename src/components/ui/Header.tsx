import { FC } from "react";
import "./Header.css";
import { Route } from "./Route";
import Link from "next/link";
import { LogoSvg } from "./Logo";
import { Avatar } from "./Avatar";
import "./Header.css";

export const Header: FC = () => {
  return (
    <div className={"header-sticky"}>
      <div className={"container"}>
        <header className={"header"}>
          <Link href={"/home"}>
            <LogoSvg />
          </Link>
          <nav className={"header-nav"}>
            <Route label="Assessments" route="/assessments" active={false} />
            <Route label="Matrix" route="/matrix" active={false} />
          </nav>
          <div className={"header-actions"}>
            <Avatar label={"John Doe"} colorPalette={"gray"} />
          </div>
        </header>
      </div>
    </div>
  );
};
