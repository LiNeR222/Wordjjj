'use client';

import { wsStore } from '@/entities/chat/model/ws-store';
import { ChatSidebar } from '@/widgets/chat-sidebar';
import { ChatMessages } from '@/widgets/chat-messages';
import { useEffect } from 'react';

export default function ChatsPage() {
  useEffect(() => {
    wsStore.connect();
    return () => wsStore.disconnect();
  }, []);

  return (
    <div className='flex h-full overflow-hidden'>
      <ChatSidebar />
      <ChatMessages />
    </div>
  );
}
