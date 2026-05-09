import React from "react";

import styles from "./add.module.css";
import Avatar from "@/components/Avatar";
import { Button, TextArea } from "@/components/ui";
import { CommentAddProps } from "./types";

export const CommentAdd: React.FC<CommentAddProps> = ({
  isViewAction = true,
  button,
  placeholder,
  textarea,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <Avatar size={38} title="D" />
        <TextArea placeholder={placeholder} className="w-full" {...textarea} />
      </div>
      {isViewAction && (
        <div className={styles.action}>
          <Button variant="dark" {...button}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
};
