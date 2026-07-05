import { FC } from "react";
import "./Button.css";

export const Button: FC<{ title: string }> = ({ title }) => {
  return <button className={"button btn-primary"}>{title}</button>;
};
