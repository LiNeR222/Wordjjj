import { VideoForm } from '@/features/video-upload';
import { ModalContextProvider } from '@/features/video-upload/model/context';
import { UploadVideoModal } from '@/features/video-upload/ui/modal';

export default function CreatePage() {
  return (
    <ModalContextProvider>
      <UploadVideoModal>
        <VideoForm />
      </UploadVideoModal>
    </ModalContextProvider>
  );
}
