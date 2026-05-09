import { VideoFormEdit } from '@/features/video-upload';
import { ModalContextProvider } from '@/features/video-upload/model/context';
import { UploadVideoModal } from '@/features/video-upload/ui/modal';
import { Header } from '@/widgets/header';

export default function EditPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <ModalContextProvider>
        <UploadVideoModal>
          <VideoFormEdit videoId={Number(params.id)} />
        </UploadVideoModal>
      </ModalContextProvider>
    </>
  );
}
