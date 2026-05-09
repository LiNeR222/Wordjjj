import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';
import styles from './button.module.css';
import { ButtonProps } from './types';

export const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, ...props }) => {
  const { className, variant = 'default', type = 'button', size = 'medium', ...rest } = props;

  return (
    <button
      {...rest}
      type={type}
      className={clsx(styles.button, className, {
        [styles.default]: variant === 'default',
        [styles.dark]: variant === 'dark',
        [styles.icon]: variant === 'icon',
        [styles.small]: size === 'small',
      })}>
      {children}
    </button>
  );
};
