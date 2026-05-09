import { CommentsList } from '@/features/video-comments/ui/comments-list';

export default async function page() {
  return <CommentsList videoId={41} />;
}
