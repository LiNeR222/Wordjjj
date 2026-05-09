import { FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

interface SwitcherProps {
  onSwitch: (value: boolean) => void;
  label: string;
  value: boolean;
}

export const Switcher = ({ onSwitch, label, value }: SwitcherProps) => {
  const isSwitched = Boolean(value);

  const handleSwitch = () => {
    const state = !isSwitched;
    onSwitch(state);
  };

  return (
    <div className='flex flex-row gap-x-3 items-center'>
      <button
        type='button'
        onClick={handleSwitch}
        className={`relative w-12 h-7 flex items-center cursor-pointer rounded-full transition-colors duration-300 
${isSwitched ? 'bg-[#5570F166]' : 'bg-[#EBEEFD]'}`}>
        <div
          className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
          ${isSwitched ? 'bg-[#5570F1] translate-x-6' : 'bg-[#7F88B6] translate-x-1'}`}>
          {isSwitched ? <FaCheck color='white' size={10} /> : <IoClose color='white' size={13} />}
        </div>
      </button>
      <span onClick={handleSwitch} className='cursor-pointer text-base'>
        {label}
      </span>
    </div>
  );
};
