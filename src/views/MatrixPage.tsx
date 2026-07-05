import { FC } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import "./MatrixPage.css";

export const MatrixPage: FC = () => {
  return (
    <div className={"matrix-page"}>
      <div className={"matrix-page-heading"}>
        <div className={"container"}>
          <Breadcrumb
            items={[{ label: "Home", href: "/home" }, { label: "Matrix" }]}
          />
          <h1 className={"matrix-page-title text-h1"}>Competence Matrix</h1>
        </div>
      </div>
    </div>
  );
};
