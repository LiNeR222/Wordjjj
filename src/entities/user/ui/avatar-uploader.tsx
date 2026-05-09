import { authStore } from '@/entities/auth/model/authStore';
import { Modal } from '@/shared/ui/modal';
import { Upload } from '@/shared/ui/upload';
import type { UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { IoIosArrowDropdownCircle, IoIosCloseCircle } from 'react-icons/io';

export const AvatarUploader: React.FC = observer(() => {
  const [isChanged, setIsChanged] = useState(false);
  if (!authStore?.userStore) return null;
  const { user, uploadAvatar, removeAvatar } = authStore.userStore;
  const { profile_picture } = user;

  const avatar = profile_picture
    ? {
        uid: '-1',
        name: 'avatar.png',
        status: 'done',
        url: profile_picture,
      }
    : null;

  const [file, setFile] = useState<UploadFile | null>(avatar as UploadFile);
  const [modal, contextHolder] = Modal.useModal();

  const onChange: UploadProps['onChange'] = ({ fileList }) => {
    setFile(fileList.length > 0 ? fileList[0] : null);
    setIsChanged(true);
  };

  const onRemove = () => {
    setFile(null);
    setIsChanged(true);
  };

  const onSave = async () => {
    if (file && file.originFileObj) {
      await uploadAvatar?.(file.originFileObj);
      setIsChanged(false);
    } else {
      const confirmed = await modal.confirm({
        title: 'Вы уверены, что хотите удалить фотографию профиля?',
        content: 'Вы не загрузили новое изображение вместо старого',
      });
      if (confirmed) {
        await removeAvatar();
        setIsChanged(false);
      }
    }
  };

  const onCancel = () => {
    setFile(avatar as UploadFile);
    setIsChanged(false);
  };

  return (
    <div className='relative flex flex-col items-center min-h-[220px] gap-4 py-5 px-6'>
      <div className='flex-1 justify-content content-center'>
        <ImgCrop rotationSlider>
          <Upload
            className='[&_.ant-upload-list-item]:!linear [&_.ant-upload-list-item]:!duration-500 hover:[&_.ant-upload-list-item]:scale-110'
            listType='picture-circle'
            fileList={file ? [file] : []}
            onChange={onChange}
            onRemove={onRemove}
            maxCount={1}
            showUploadList={{ showPreviewIcon: false }}>
            {!file && '+ Upload'}
          </Upload>
        </ImgCrop>
      </div>
      <div className='absolute bottom-0 space-x-4'>
        {isChanged && (
          <>
            <button
              onClick={onSave}
              className='text-3xl text-gray-300  hover:text-gray-400 transition-all duration-300'>
              <IoIosArrowDropdownCircle />
            </button>
            <button
              onClick={onCancel}
              className='text-3xl text-gray-300 hover:text-gray-400 transition-all duration-300'>
              <IoIosCloseCircle />
            </button>
          </>
        )}
      </div>
      {contextHolder}
    </div>
  );
});
