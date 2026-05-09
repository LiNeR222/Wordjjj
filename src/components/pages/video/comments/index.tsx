import React from 'react';
import styles from './comments.module.css';

import { CommentAdd, CommentCard } from '@/components/comment (obsolete)';

const Add = () => {
  const [focused, setFocused] = React.useState(false);

  const [value, setValue] = React.useState('');

  return (
    <CommentAdd
      placeholder='Напишите ваш комментарий'
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

export const VideoComments = () => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>
        Комментарии <span>24</span>
      </p>
      <div className={styles.list}>
        <CommentCard />
        <CommentCard />
      </div>
      <div className={styles.write}>
        <Add />
      </div>
    </div>
  );
};
