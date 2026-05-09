'use client';

import { useLoginBotUrls } from '@/entities/session/lib/use-login-bot-urls';
import { LoginBotProvider } from '@/entities/session/types';
import Link from 'next/link';
import { FC, useEffect, useMemo, useState } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import QRCode from './qr';
import styles from './auth.module.css';

interface AuthProps {
  sessionId?: string;
  title: string;
  subtitle: string;
  hintText: string;
  actionText: string;
}

const MaxIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox='0 0 32 32' aria-hidden='true' className={className}>
    <defs>
      <linearGradient id='max-brand-gradient' x1='4' y1='28' x2='28' y2='4' gradientUnits='userSpaceOnUse'>
        <stop offset='0%' stopColor='#43C6FF' />
        <stop offset='55%' stopColor='#3455FF' />
        <stop offset='100%' stopColor='#8F3DFF' />
      </linearGradient>
    </defs>

    <rect x='2' y='2' width='28' height='28' rx='9' fill='url(#max-brand-gradient)' />
    <path
      fill='#FFFFFF'
      fillRule='evenodd'
      d='M16 5.4C10.15 5.4 5.4 10.15 5.4 16c0 2.27.72 4.39 1.95 6.12l-.92 4.21c-.1.48.08.97.46 1.27.38.29.89.35 1.32.16l4.18-1.81c1.16.49 2.43.76 3.76.76 5.85 0 10.6-4.75 10.6-10.6S21.85 5.4 16 5.4Zm0 5.08a5.52 5.52 0 1 1 0 11.04 5.52 5.52 0 0 1 0-11.04Z'
      clipRule='evenodd'
    />
  </svg>
);

export const Auth: FC<AuthProps> = ({ sessionId = '', title, subtitle, hintText, actionText }) => {
  const loginUrls = useLoginBotUrls(sessionId);
  const [provider, setProvider] = useState<LoginBotProvider>('telegram');

  useEffect(() => {
    if (provider === 'max' && !loginUrls?.max) {
      setProvider('telegram');
    }
  }, [loginUrls?.max, provider]);

  const selectedUrl = useMemo(() => {
    if (!loginUrls) {
      return null;
    }

    if (provider === 'max' && loginUrls.max) {
      return loginUrls.max;
    }

    return loginUrls.telegram;
  }, [loginUrls, provider]);

  if (!selectedUrl || !loginUrls) {
    return null;
  }

  const providerLabel = provider === 'telegram' ? 'Telegram' : 'MAX';
  const buttonLabel = `${actionText} ${providerLabel}`;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle} dangerouslySetInnerHTML={{ __html: subtitle }} />

      <div className={styles.providerSwitch}>
        <button
          type='button'
          className={`${styles.providerButton} ${styles.providerButtonTelegram} ${
            provider === 'telegram' ? styles.providerButtonActive : ''
          }`}
          onClick={() => setProvider('telegram')}>
          <span className={styles.providerIconWrap}>
            <FaTelegramPlane className={styles.providerIcon} />
          </span>
          <span>Telegram</span>
        </button>

        <button
          type='button'
          className={`${styles.providerButton} ${styles.providerButtonMax} ${
            provider === 'max' ? styles.providerButtonActive : ''
          }`}
          onClick={() => setProvider('max')}
          disabled={!loginUrls.max}>
          <span className={styles.providerIconWrap}>
            <MaxIcon className={styles.maxIcon} />
          </span>
          <span>MAX</span>
        </button>
      </div>

      <div className={styles.qrCard}>
        <QRCode value={selectedUrl} size={168} />
      </div>

      <p className={styles.hint}>{hintText}</p>

      <div className={styles.divider}>
        <span className={styles.dividerLine}></span>
        <p>или нажмите</p>
        <span className={styles.dividerLine}></span>
      </div>

      <Link
        className={`${styles.ctaLink} ${provider === 'telegram' ? styles.ctaTelegram : styles.ctaMax}`}
        href={selectedUrl}
        target='_blank'
        rel='noopener noreferrer'>
        <span className={styles.ctaLabel}>
          {provider === 'telegram' ? (
            <FaTelegramPlane className={styles.providerIcon} />
          ) : (
            <MaxIcon className={styles.maxIcon} />
          )}
          {buttonLabel}
        </span>
      </Link>
    </div>
  );
};
