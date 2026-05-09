import { VideoForm } from '@/features/video-upload';
import { ModalContextProvider } from '@/features/video-upload/model/context';
import { UploadVideoModal } from '@/features/video-upload/ui/modal';
import { Header } from '@/widgets/header';

export default function CreatePage() {
  return (
    <>
      <Header />
      <ModalContextProvider>
        <UploadVideoModal>
          <VideoForm />
        </UploadVideoModal>
      </ModalContextProvider>
    </>
  );
}
