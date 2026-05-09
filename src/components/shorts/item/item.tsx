"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "@/components/player";

import styles from "./item.module.css";
import { IoMdPause } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui";

export const ShortItem = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;

    const updateProgress = () => {
      if (video && video.duration) {
        const progressPercentage = (video.currentTime / video.duration) * 100;
        setProgress(progressPercentage);
      }
    };

    if (video) {
      video.addEventListener("timeupdate", updateProgress);
    }

    return () => {
      if (video) {
        video.removeEventListener("timeupdate", updateProgress);
      }
    };
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (video) {
      const boundingRect = e.currentTarget.getBoundingClientRect();
      const clickPosition = e.clientX - boundingRect.left;
      const newTime = (clickPosition / boundingRect.width) * video.duration;
      video.currentTime = newTime;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.actions}>
        <button
          onClick={() =>
            videoRef.current?.paused
              ? videoRef.current.play()
              : videoRef.current?.pause()
          }>
          {videoRef.current?.paused ? <FaPlay /> : <IoMdPause />}
        </button>
      </div>
      <div
        className="relative h-full"
        onClick={() =>
          videoRef.current?.paused
            ? videoRef.current.play()
            : videoRef.current?.pause()
        }>
        <Player isShort ref={videoRef} controls={false} />
      </div>
      <div className={styles.info}>
        <div className={styles.author}>
          <Avatar size={28} title="Y" />
          <p>Hakuna Matata</p>
          <Button size="small">Подписаться</Button>
        </div>
        <span className={styles.info__description}>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur
          mollitia nobis facere accusamus...
        </span>
      </div>
      <div className={styles.progress} onClick={handleSeek}>
        <span style={{ width: `${progress}%` }}></span>
      </div>
    </div>
  );
};
