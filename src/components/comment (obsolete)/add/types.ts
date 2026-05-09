import React from "react";

export type CommentAddProps = {
  isViewAction?: boolean;
  button?: React.ComponentProps<"button">;
  textarea?: React.ComponentProps<"textarea">;
  placeholder?: string;
};
