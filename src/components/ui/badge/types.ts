import React from "react";

export type BadgeProps = {
  color?: "default" | "blue" | "green" | "yellow";
  size?: "small" | "middle" | "large";
} & React.ComponentProps<"div">;
