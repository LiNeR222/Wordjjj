import React from "react";
import { BadgeProps } from "./types";

import styles from "./badge.module.css";
import clsx from "clsx";

export const Badge: React.FC<React.PropsWithChildren<BadgeProps>> = (props) => {
  const { color = "default", children, size = "small", ...rest } = props;
  return (
    <div
      {...rest}
      className={clsx(styles.badge, rest.className, {
        [styles.green]: color === "green",
        [styles.default]: color === "default",
        [styles.yellow]: color === "yellow",
        [styles.blue]: color === "blue",
        [styles.large]: size === "large",
      })}>
      <span>{children}</span>
    </div>
  );
};
