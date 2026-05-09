import { Dropdown, Input } from 'antd';
import { useController, UseControllerProps, useFormContext } from 'react-hook-form';
import { ISubmitData, WebhookTriggerType } from '../types';
import { useState, useRef, useEffect } from 'react';
import styles from './webhook-field.module.css';

interface TriggerOption {
  key: WebhookTriggerType;
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
];

function WebhookField(props: UseControllerProps<ISubmitData, 'webhookUrl'>) {
  const {
    field,
    fieldState: { error },
  } = useController(props);
  
  const { setValue, watch } = useFormContext<ISubmitData>();
  const selectedTrigger = watch('webhookTrigger') || 'view_start';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  const handleTriggerSelect = (trigger: WebhookTriggerType) => {
    setValue('webhookTrigger', trigger);
    setIsDropdownOpen(false);
  };

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
    <div className='w-full flex flex-col gap-y-2'>
      <p className='text-ml font-semibold'>Webhook URL для лидов</p>
      <Dropdown
        open={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        trigger={['click']}
        dropdownRender={() => dropdownContent}
        placement={isMobile ? "bottomCenter" : "bottomLeft"}
      >
        <Input
          placeholder='https://your-webhook-url.com/endpoint'
          value={field.value}
          onChange={field.onChange}
          className={styles.webhookInputSimple}
          onClick={() => setIsDropdownOpen(true)}
        />
      </Dropdown>
      {error && <p className='text-red-500'>{error.message}</p>}
      <p className='text-xs text-gray-500'>
        URL для отправки уведомлений о просмотре видео. Будет вызываться при выбранном триггере: {' '}
        <strong>{TRIGGER_OPTIONS.find(o => o.key === selectedTrigger)?.description}</strong>
      </p>
    </div>
  );
}

export default WebhookField; 