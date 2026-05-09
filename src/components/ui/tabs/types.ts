import React from "react";

export type TabOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

export type TabsProps = {
  options: TabOption[];
  value?: TabOption;
  onChange?: (value: TabOption) => void;
  place?: "left" | "right";
  renderProps?: (props: { option: TabOption }) => React.ReactNode;
};
