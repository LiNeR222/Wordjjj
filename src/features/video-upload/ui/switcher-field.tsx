import { useController, useFormContext } from 'react-hook-form';
import { FormValues } from '../types';
import { Switcher } from './switcher';

interface SwitcherFieldProps {
  name: 'vertical' | 'free' | 'permission_rewind' | 'advertisement';
}

export const SwitcherField = ({ name }: SwitcherFieldProps) => {
  const { control } = useFormContext<FormValues>();
  const {
    field: { value, onChange },
  } = useController({ control, name });

  const labelMap: Record<SwitcherFieldProps['name'], string> = {
    vertical: 'Вертикальное видео',
    free: 'Бесплатное видео',
    permission_rewind: 'Возможность перемотки',
    advertisement: 'Рекламное видео',
  };

  return <Switcher onSwitch={onChange} label={labelMap[name]} value={value} />;
};
