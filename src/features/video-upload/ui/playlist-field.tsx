import { authStore } from '@/entities/auth/model/authStore';
import { channelsListStore } from '@/entities/channel/model/channels-list-store';
import { playlistApi } from '@/entities/playlist/api';
import { SPlaylistCreateRequest, SPlaylistInfo } from '@/entities/playlist/types';
import { Button } from '@/shared/ui/button/button';
import { message } from '@/shared/ui/message';
import { PlusOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Radio, Select } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { FormValues } from '../types';

const PlaylistField = observer(() => {
  const { control } = useFormContext<FormValues>();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: 'playlist_id' });

  const [playlists, setPlaylists] = useState<SPlaylistInfo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUserChannel();
  }, []);

  useEffect(() => {
    if (channelId) {
      fetchPlaylists();
    }
  }, [channelId]);

  const fetchUserChannel = async () => {
    try {
      if (!authStore.isAuth || !authStore.user?.id) {
        console.warn('Пользователь не авторизован для получения канала');
        return;
      }

      const userId = authStore.user.id;
      setChannelId(userId);

      try {
        await channelsListStore.fetchChannelById(userId);
      } catch (error) {
        console.error('Ошибка при загрузке канала в store:', error);
      }
    } catch (error) {
      console.error('Ошибка при получении ID канала пользователя:', error);
      message.error('Не удалось получить ID канала');
    }
  };

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistApi.getUserPlaylists(0, 100);
      setPlaylists(response.items);
    } catch (error) {
      console.error('Ошибка при загрузке плейлистов:', error);
      message.error('Не удалось загрузить плейлисты');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      if (!channelId) {
        message.error('ID канала не найден. Невозможно создать плейлист');
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      const playlistData: SPlaylistCreateRequest = {
        channel_id: channelId,
        title: values.title,
        description: values.description,
        format: values.format,
        free: values.free,
        permission_skip: values.permission_skip,
        date_publication: new Date().toISOString(),
      };

      const response = await playlistApi.createPlaylist(playlistData);
      message.success('Плейлист успешно создан');

      setPlaylists([...playlists, response]);
      field.onChange(response.id);

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Ошибка при создании плейлиста:', error);
      message.error('Не удалось создать плейлист');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div className='w-full flex flex-col gap-y-2'>
      <p className='text-ml font-semibold'>Плейлист</p>
      <Select
        placeholder='Выберите плейлист'
        value={field.value ?? undefined}
        onChange={v => field.onChange(v ?? null)}
        loading={loading}
        allowClear
        style={{ width: '100%' }}
        dropdownRender={menu => (
          <>
            {menu}
            <div className='px-2 py-2 border-t border-gray-200'>
              <Button
                onClick={() => setIsModalOpen(true)}
                type='primary'
                size='small'
                variant='solid'
                color='default'
                block
                disabled={!channelId}>
                <PlusOutlined /> Создать новый плейлист
              </Button>
            </div>
          </>
        )}
        options={playlists.map(playlist => ({
          value: playlist.id,
          label: playlist.title,
        }))}
      />
      {error && <p className='text-red-500'>{error.message}</p>}
      {!channelId && <p className='text-xs text-orange-500 mt-1'>Ожидаем загрузку информации о канале...</p>}

      <Modal
        title='Создание нового плейлиста'
        open={isModalOpen}
        onOk={handleCreatePlaylist}
        onCancel={handleCancel}
        okText='Создать'
        cancelText='Отмена'
        confirmLoading={loading}>
        <Form form={form} layout='vertical'>
          <Form.Item
            name='title'
            label='Название плейлиста'
            rules={[{ required: true, message: 'Пожалуйста, введите название плейлиста' }]}>
            <Input placeholder='Введите название' />
          </Form.Item>

          <Form.Item
            name='description'
            label='Описание плейлиста'
            rules={[{ required: true, message: 'Пожалуйста, введите описание плейлиста' }]}>
            <Input.TextArea rows={3} placeholder='Введите описание' />
          </Form.Item>

          <Form.Item
            name='format'
            label='Формат плейлиста'
            rules={[{ required: true, message: 'Пожалуйста, выберите формат плейлиста' }]}
            initialValue='public'>
            <Radio.Group>
              <Radio value='public'>Публичный</Radio>
              <Radio value='link'>По ссылке</Radio>
              <Radio value='private'>Приватный</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name='free' label='Бесплатный доступ' initialValue={true} valuePropName='checked'>
            <Radio.Group>
              <Radio value={true}>Да</Radio>
              <Radio value={false}>Нет</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name='permission_skip' label='Разрешить пропуск' initialValue={true} valuePropName='checked'>
            <Radio.Group>
              <Radio value={true}>Да</Radio>
              <Radio value={false}>Нет</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default PlaylistField;
