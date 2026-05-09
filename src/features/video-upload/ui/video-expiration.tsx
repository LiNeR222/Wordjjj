'use client';

import { DatePicker, Form, Tooltip } from 'antd';
import { FC } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { FormValues } from '../types';
import { InfoCircleOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/ru_RU';
import dayjs, { Dayjs } from 'dayjs';

export const VideoExpiration: FC = () => {
  const { control } = useFormContext<FormValues>();
  
  const { field: publicityField } = useController({
    control,
    name: 'publicity_expiration',
    defaultValue: null,
  });

  const { field: lifetimeField } = useController({
    control,
    name: 'lifetime_expiration',
    defaultValue: null,
  });

  const handlePublicityChange = (date: Dayjs | null) => {
    publicityField.onChange(date ? date.toISOString() : null);
  };

  const handleLifetimeChange = (date: Dayjs | null) => {
    lifetimeField.onChange(date ? date.toISOString() : null);
  };

  return (
    <div className="w-full flex flex-col gap-y-4">
      <Form.Item
        label={
          <div className="flex items-center gap-x-2">
            <span>Срок публичности ролика</span>
            <Tooltip title="После этого времени ролик перестанет показываться в вашей ленте и нельзя будет найти через поиск.">
              <InfoCircleOutlined />
            </Tooltip>
          </div>
        }
      >
        <DatePicker
          locale={locale}
          placeholder="Выберите дату и время"
          showTime
          format="DD.MM.YYYY HH:mm"
          onChange={handlePublicityChange}
          value={publicityField.value ? dayjs(publicityField.value as string) : null}
          className="w-full"
        />
        <div className="text-xs text-red-500 mt-1">
          Внимание, после этого времени ролик перестанет показываться в вашей ленте и нельзя будет найти через поиск.
        </div>
      </Form.Item>

      <Form.Item
        label={
          <div className="flex items-center gap-x-2">
            <span>Срок жизни ролика</span>
            <Tooltip title="После этого времени ролик будет безвозвратно удален из нашего хранилища.">
              <InfoCircleOutlined />
            </Tooltip>
          </div>
        }
      >
        <DatePicker
          locale={locale}
          placeholder="Выберите дату и время"
          showTime
          format="DD.MM.YYYY HH:mm"
          onChange={handleLifetimeChange}
          value={lifetimeField.value ? dayjs(lifetimeField.value as string) : null}
          className="w-full"
        />
        <div className="text-xs text-red-500 mt-1">
          Внимание, после этого времени ролик будет безвозвратно удален из нашего хранилища.
        </div>
      </Form.Item>
    </div>
  );
}; 