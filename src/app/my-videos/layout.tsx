import { headerHeight } from '@/shared/config';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className={`w-full fixed inset-0 z-[40]`} style={{ height: headerHeight }}>
        <Header />
        <div className='relative z-[40] h-0 w-full border-b-[0.4px] border-b-gray-300'></div>
      </div>
      <div className={`flex pt-[${headerHeight}px] min-h-screen`}>
        <Sidebar />
        {children}
      </div>
    </>
  );
}
