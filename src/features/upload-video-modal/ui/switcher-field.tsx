import { useController, UseControllerProps } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { ISubmitData } from '../types';

interface SwitcherFieldProps extends UseControllerProps<ISubmitData, 'isVertical' | 'isFreeVideo' | 'isAllowRewind' | 'isPremium'> {
  label: string;
  onChange?: (checked: boolean) => void;
}

function SwitcherField(props: SwitcherFieldProps) {
  const {
    field: { value, onChange: fieldOnChange },
  } = useController(props);

  const { label, onChange } = props;

  const handleChange = (checked: boolean) => {
    fieldOnChange(checked);
    if (onChange) {
      onChange(checked);
    }
  };

  return (
    <div className='flex flex-row gap-x-3 items-center'>
      <button
        type='button'
        onClick={() => {
          handleChange(!value);
        }}
        className={`relative w-12 h-7 flex items-center cursor-pointer rounded-full transition-colors duration-300 
${value ? 'bg-[#5570F166]' : 'bg-[#EBEEFD]'}`}>
        <div
          className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
            ${value ? 'bg-[#5570F1] translate-x-6' : 'bg-[#7F88B6] translate-x-1'}`}>
          {value ? <FaCheck color='white' size={10} /> : <IoClose color='white' size={13} />}
        </div>
      </button>
      <span
        onClick={() => {
          handleChange(!value);
        }}
        className='cursor-pointer text-base'>
        {label}
      </span>
    </div>
  );
}

export default SwitcherField;
