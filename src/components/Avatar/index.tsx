import React from "react";

import styles from "./avatar.module.css";

import clsx from "clsx";
import { AvatarProps } from "./types";

const Avatar: React.FC<AvatarProps> = (props) => {
  const { size = 32, title, className, ...rest } = props;
  return (
    <div
      {...rest}
      className={clsx(styles.avatar, className)}
      style={{
        height: size,
        width: size,
        fontSize: size / 2,
        ...props.style,
      }}>
      {title.charAt(0)}
    </div>
  );
};

export default Avatar;
