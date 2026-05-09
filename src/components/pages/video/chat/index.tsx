import React from 'react';

import { CommentAdd, CommentCard } from '@/components/comment (obsolete)';
import styles from './chat.module.css';

const Add = () => {
  const [focused, setFocused] = React.useState(false);

  const [value, setValue] = React.useState('');

  return (
    <CommentAdd
      placeholder='Напишите ваш вопрос'
      textarea={{
        rows: focused ? 4 : 1,
        onChange: e => setValue(e.target.value),
        onFocus: () => setFocused(true),
        onBlur: () => !value && setFocused(false),
        value,
      }}
      isViewAction={focused}
    />
  );
};

export const VideoChat: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Чат с автором</p>
      <div className={styles.list}>
        <CommentCard isChat />
      </div>
      <div className={styles.write}>
        <Add />
      </div>
    </div>
  );
};
