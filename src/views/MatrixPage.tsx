import { FC } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import "./MatrixPage.css";

export const MatrixPage: FC = () => {
  return (
    <div className={"matrix-page"}>
      <div className={"container"}>
        <div className={"matrix-page-inner"}>
          <Breadcrumb
            items={[{ label: "Home", href: "/home" }, { label: "Matrix" }]}
          />
          <div className={"matrix-page-header"}>
            <h2 className={"matrix-page-title text-h2"}>Competence Matrix</h2>
          </div>
        </div>
      </div>
    </div>
  );
};
