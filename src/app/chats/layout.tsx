import { Header } from '@/widgets/header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Чаты | Интересно и точка',
  description: 'Сообщения и переписки',
};

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-screen flex flex-col overflow-hidden'>
      <Header />
      <div className='flex-1 bg-white overflow-hidden'>
        {children}
      </div>
    </div>
  );
}
