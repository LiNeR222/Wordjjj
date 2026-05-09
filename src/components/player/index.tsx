"use client";
import { forwardRef, ComponentProps } from "react";
import clsx from "clsx";

export const Player = forwardRef<
  HTMLVideoElement,
  { isShort?: boolean } & ComponentProps<"video">
>((props, ref) => {
  const { isShort = false, ...rest } = props;
  return (
    <video
      className={clsx("h-full bg-black z-2", { "": isShort })}
      tabIndex={1}
      loop
      muted
      width="100%"
      controls
      height="auto"
      autoPlay
      src="https://cdn.pixabay.com/video/2016/10/09/5858-865412786_large.mp4"
      ref={ref}
      {...rest}></video>
  );
});

Player.displayName = "Player";
