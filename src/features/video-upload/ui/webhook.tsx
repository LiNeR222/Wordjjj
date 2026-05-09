import { webhookApi } from '@/entities/webhook/api';
import { WebhookEventType } from '@/entities/webhook/types';
import { Dropdown, Input, Button, message, Tooltip, Space, Spin } from 'antd';
import { FC, RefObject, useImperativeHandle, useState, useRef, useEffect } from 'react';
import styles from './webhook.module.css';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../types';

interface WebhookProps {
  videoId: number | null;
  webhookRef: RefObject<{ submitWebhooks: () => void } | null>;
}

interface WebhookItem {
  id?: number;
  url: string;
  triggerType: WebhookEventType;
  isNew?: boolean;
  isEditing?: boolean;
}

interface TriggerOption {
  key: WebhookEventType;
  label: string;
  description: string;
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    key: 'view_start',
    label: 'Начало просмотра',
    description: 'Событие начала просмотра (получен 1 или более сегментов)',
  },
  {
    key: 'comment',
    label: 'Комментарий',
    description: 'Событие добавления комментария к видео',
  },
  {
    key: 'like',
    label: 'Лайк',
    description: 'Событие когда пользователь ставит лайк видео',
  },
  {
    key: 'subscribe',
    label: 'Подписка',
    description: 'Событие когда пользователь подписывается на канал',
  },
];

export const Webhook: FC<WebhookProps> = ({ videoId, webhookRef }) => {
  const { watch } = useFormContext<FormValues>();
  const channelId = watch('channel_id');
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<WebhookEventType>('view_start');
  const [currentUrl, setCurrentUrl] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchWebhooks = async () => {
      if (!videoId || !channelId) return;
      
      try {
        setIsLoading(true);
        
        const videoWebhooks = await webhookApi.getWebhooksByVideoId(videoId);
        
        const channelWebhooks = await webhookApi.getWebhooksByChannelId(channelId);
        
        const allWebhooks = [...videoWebhooks, ...channelWebhooks].map(webhook => {
          const trigger = webhook.triggers[0];
          if (!trigger) return null;
          
          return {
            id: webhook.id,
            url: webhook.url,
            triggerType: trigger.event_type,
          };
        }).filter(Boolean) as WebhookItem[];
        
        setWebhooks(allWebhooks);
      } catch (error) {
        console.error('Ошибка при загрузке вебхуков:', error);
        message.error('Не удалось загрузить существующие вебхуки');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWebhooks();
  }, [videoId, channelId]);

  const handleTriggerSelect = (trigger: WebhookEventType) => {
    setSelectedTrigger(trigger);
    setIsDropdownOpen(false);
  };

  const addWebhook = () => {
    if (!currentUrl.trim()) {
      message.error('URL не может быть пустым');
      return;
    }

    if (webhooks.some(hook => hook.triggerType === selectedTrigger)) {
      message.error(`Webhook для триггера "${TRIGGER_OPTIONS.find(o => o.key === selectedTrigger)?.label}" уже существует`);
      return;
    }

    if (editingIndex !== null) {
      const updatedWebhooks = [...webhooks];
      updatedWebhooks[editingIndex] = {
        ...updatedWebhooks[editingIndex],
        url: currentUrl,
        triggerType: selectedTrigger,
        isEditing: true
      };
      setWebhooks(updatedWebhooks);
      setEditingIndex(null);
    } else {
      setWebhooks([
        ...webhooks,
        { url: currentUrl, triggerType: selectedTrigger, isNew: true }
      ]);
    }

    setCurrentUrl('');
    setSelectedTrigger('view_start');
  };

  const editWebhook = (index: number) => {
    const webhook = webhooks[index];
    setCurrentUrl(webhook.url);
    setSelectedTrigger(webhook.triggerType);
    setEditingIndex(index);
  };

  const deleteWebhook = (index: number) => {
    const updatedWebhooks = [...webhooks];
    updatedWebhooks.splice(index, 1);
    setWebhooks(updatedWebhooks);
  };

  const submitWebhooks = async () => {
    if (!videoId) {
      message.error('ID видео отсутствует');
      return;
    }

    if (!channelId) {
      message.error('ID канала отсутствует');
      return;
    }

    try {
      for (const webhook of webhooks) {
        if (webhook.isNew || webhook.isEditing) {
          if (webhook.triggerType === 'subscribe') {
            await webhookApi.createChannelWebhook(channelId, webhook.url, webhook.triggerType);
          } else {
            await webhookApi.createVideoWebhook(videoId, webhook.url, webhook.triggerType);
          }
        }
      }
      
      message.success('Webhooks сохранены успешно');
    } catch (error) {
      console.error('Ошибка при сохранении webhooks:', error);
      message.error('Не удалось сохранить webhooks, но видео было загружено');
    }
  };

  useImperativeHandle(webhookRef, () => ({
    submitWebhooks,
  }));

  const dropdownContent = (
    <div className={styles.triggerDropdown} ref={dropdownRef}>
      <div className={styles.dropdownHeader}>
        <h4>Выберите триггер</h4>
      </div>
      <div className={styles.triggerOptions}>
        {TRIGGER_OPTIONS.map((option) => (
          <div 
            key={option.key} 
            className={`${styles.triggerOption} ${selectedTrigger === option.key ? styles.selected : ''}`}
            onClick={() => handleTriggerSelect(option.key)}
          >
            <h4>{option.label}</h4>
            <p>{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className='w-full flex flex-col gap-y-4'>
      <p className='text-ml font-semibold'>Webhook URL для лидов</p>
      
      {isLoading ? (
        <div className="text-center py-4">
          <Spin tip="Загрузка вебхуков..." />
        </div>
      ) : (
        <>
          {/* Список добавленных вебхуков */}
          {webhooks.length > 0 && (
            <div className='flex flex-col gap-y-2 mb-2'>
              {webhooks.map((webhook, index) => (
                <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-md'>
                  <div>
                    <p className='font-medium'>{webhook.url}</p>
                    <p className='text-xs text-gray-500'>
                      Триггер: {TRIGGER_OPTIONS.find(o => o.key === webhook.triggerType)?.label}
                    </p>
                  </div>
                  <Space>
                    <Tooltip title="Редактировать">
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        onClick={() => editWebhook(index)}
                      />
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <Button 
                        danger 
                        icon={<DeleteOutlined />} 
                        size="small" 
                        onClick={() => deleteWebhook(index)}
                      />
                    </Tooltip>
                  </Space>
                </div>
              ))}
            </div>
          )}

          {/* Форма добавления/редактирования вебхука */}
          <div className='flex gap-x-2'>
            <div className='flex-grow'>
              <Dropdown
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
                trigger={['click']}
                dropdownRender={() => dropdownContent}
                placement={isMobile ? "bottomCenter" : "bottomLeft"}
              >
                <Input
                  placeholder='https://your-webhook-url.com/endpoint'
                  value={currentUrl}
                  onChange={e => setCurrentUrl(e.target.value.trim())}
                  className={styles.webhookInputSimple}
                  onClick={() => setIsDropdownOpen(true)}
                />
              </Dropdown>
            </div>
            <Button 
              type="default"
              className="bg-black text-white hover:bg-black hover:opacity-90"
              icon={editingIndex !== null ? <EditOutlined /> : <PlusOutlined />}
              onClick={addWebhook}
            >
              {editingIndex !== null ? 'Обновить' : 'Добавить'}
            </Button>
          </div>
        </>
      )}
      
      <p className='text-xs text-gray-500'>
        URL для отправки уведомлений. Выберите триггер: {' '}
        <strong>{TRIGGER_OPTIONS.find(o => o.key === selectedTrigger)?.description}</strong>
      </p>
    </div>
  );
};
