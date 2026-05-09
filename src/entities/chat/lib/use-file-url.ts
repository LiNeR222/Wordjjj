import { useEffect, useState } from 'react';
import {
  resolveChatMediaBlob,
  resolveChatMediaUrl,
} from './chat-media-cache';

export const useFileUrl = (fileId: number | null, thumbnail = false) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) return;

    let revoked = false;
    let objectUrl: string | null = null;
    let usesObjectUrl = false;

    resolveChatMediaBlob(fileId, thumbnail)
      .then(blob => {
        if (revoked) return;
        usesObjectUrl = true;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(async err => {
        console.error(`[useFileUrl] Failed to resolve cached media ${fileId}:`, err);
        try {
          const directUrl = await resolveChatMediaUrl(fileId, thumbnail);
          if (!revoked) {
            usesObjectUrl = false;
            objectUrl = null;
            setUrl(directUrl);
          }
        } catch (directUrlError) {
          console.error(`[useFileUrl] Failed to resolve direct media URL ${fileId}:`, directUrlError);
        }
      });

    return () => {
      revoked = true;
      if (usesObjectUrl && objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, thumbnail]);

  return url;
};
