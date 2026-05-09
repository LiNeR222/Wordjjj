import { SidebarNavItem } from './sidebar-nav-item';

export const Sidebar = () => {
  return (
    <div className='fixed left-0 top-0 h-full hidden md:w-12 bg-white border-r-[0.4px] border-gray-300 md:flex flex-col items-center pt-10 py-4 z-10'>
      <div className='h-full flex flex-col justify-between'>
        <nav className='flex flex-col items-center mt-6 space-y-6'>
          {/* <SidebarNavItem icon='user' /> */}
          <SidebarNavItem icon='video' path='/my-videos' title='Мое видео' />
          {/* <SidebarNavItem icon='target' />
          <SidebarNavItem icon='tv' />
          <SidebarNavItem icon='users' />
          <SidebarNavItem icon='pie-chart' /> */}
        </nav>
        <div className='pb-2 flex justify-center'>
          <SidebarNavItem icon='power' title='logout' />
        </div>
      </div>
    </div>
  );
};
