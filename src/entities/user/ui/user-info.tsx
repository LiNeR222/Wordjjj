import { observer } from 'mobx-react-lite';
import { MdOutlineSubscriptions, MdOutlineRssFeed } from "react-icons/md";

export const UserInfo = observer(() => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-4 cursor-pointer text-base text-gray-600'>
        <MdOutlineSubscriptions className='w-6 h-6 ' />
        <span className=' underline'>Мои каналы</span>
      </div>
      <div className='flex items-center space-x-4 cursor-pointer text-base text-gray-600'>
        <MdOutlineRssFeed className='w-6 h-6 text-gray-600 text-base' />
        <span className='underline'>Мои подписки</span>
      </div>
    </div>
  );
});
