'use client';

import React, { useEffect, useState } from "react";
import styles from "./collection.module.css";
import { Switch } from "@/components/ui/switch";
import { Recommendations } from "@/entities/video/types";
import { VideoCardMemo } from "@/entities/video";

interface VideoCollectionsProps {
  currentVideoId?: number;
}

export const VideoCollections: React.FC<VideoCollectionsProps> = ({ currentVideoId }) => {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/videos/recommendations?limit=10&category=video');
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching video recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const filteredRecommendations = recommendations?.items?.filter(
    video => !currentVideoId || video.video_id !== currentVideoId
  ) || [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <h2 className={styles.title}>Рекомендации</h2>
        <div className={styles.autoplay}>
          <span>Авто</span>
          <Switch />
        </div>
      </div>
      <div className={styles.list}>
        {loading ? (
          <div className="flex justify-center items-center p-4">Загрузка рекомендаций...</div>
        ) : filteredRecommendations.length > 0 ? (
          filteredRecommendations.slice(0, 5).map((video, index) => (
            <VideoCardMemo key={`recommendation-${video.video_id || index}`} {...video} />
          ))
        ) : (
          <div className="text-center p-4">Нет доступных рекомендаций</div>
        )}
      </div>
    </div>
  );
};
