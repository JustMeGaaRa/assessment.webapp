import Link from "next/link";
import "./Breadcrumb.css";
import React, { FC } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export const Breadcrumb: FC<{
  items: BreadcrumbItem[];
}> = ({ items }) => {
  return (
    <nav className="breadcrumb">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="breadcrumb-sep">/</span>}
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
