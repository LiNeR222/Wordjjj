import { Input as BaseInput } from "@base-ui-components/react/input";
import React from "react";
import clsx from "clsx";

import styles from "./input.module.css";

export const Input: React.FC<React.ComponentProps<"input">> = (props) => {
  const { className, ...rest } = props;
  return <BaseInput {...rest} className={clsx(styles.input, className)} />;
};

export const TextArea: React.FC<React.ComponentProps<"textarea">> = (props) => {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={clsx(styles.input, styles.textarea, className)}
    />
  );
};
