import { AuthRouter } from '@/entities/auth/ui/auth-router';
import { SessionURLListener } from '@/entities/session/model/session-url-listener';
import { UserProfileModal } from '@/entities/user/ui/user-profile-modal';
import { PaymentSuccessModal } from '@/features/payment-success';
import { ConfigProvider } from 'antd';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Интересно и точка',
    template: '%s | Интересно и точка'
  },
  description: 'Платформа для просмотра и публикации видеоконтента',
  keywords: ['видео', 'контент', 'стриминг', 'креаторы'],
  authors: [{ name: 'Интересно и точка' }],
  creator: 'Интересно и точка',
  publisher: 'Интересно и точка',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://interesnoitochka.ru',
    siteName: 'Интересно и точка',
    title: 'Интересно и точка',
    description: 'Платформа для просмотра и публикации видеоконтента',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Интересно и точка',
    description: 'Платформа для просмотра и публикации видеоконтента',
  },
  metadataBase: new URL('https://interesnoitochka.ru'),
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <html lang='ru'>
      <head>
        {/* Yandex.Metrika counter */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(101225886, "init", {
                 clickmap:true,
                 trackLinks:true,
                 accurateTrackBounce:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/101225886" style={{position: 'absolute', left: '-9999px'}} alt="" />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
      </head>
      <body className={`antialiased`}>
        <div className='min-h-screen w-full flex flex-col'>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                borderRadius: 12,
              },
              components: {
                Dropdown: {
                  borderRadius: 12,
                },
                Modal: {
                  colorPrimaryHover: '#FFF',
                },
              },
            }}>
            {children}
            {modal}
            <UserProfileModal />
            <AuthRouter />
            <PaymentSuccessModal />
            <Suspense fallback={null}>
              <SessionURLListener />
            </Suspense>
          </ConfigProvider>
        </div>
      </body>
    </html>
  );
}
