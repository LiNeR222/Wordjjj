import { authStore } from '@/entities/auth/model/authStore';
import { Icon } from '@/shared/ui';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';

export const UsernameEditor = observer(() => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!authStore.userStore) return null;
  const {
    user,
    isEditingUsername,
    formErrors,
    validateUsername,
    toggleEditUsername,
    saveUsernameChanges,
    setErrors,
    resetErrors,
  } = authStore?.userStore;

  useEffect(() => {
    setValue(user.name);
    resetErrors();
  }, [user.name]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) => {
    e.preventDefault();
    if (value === user.name) {
      setErrors({ username: 'Имя не изменилось' });
      inputRef.current?.focus();
      return;
    } else if (validateUsername(value)) {
      saveUsernameChanges(value);
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <div className='space-y-1'>
      <label className='block text-[17px] font-bold text-black'>Имя пользователя</label>
      <div className='flex items-center'>
        {isEditingUsername ? (
          <form onSubmit={handleSubmit} className='relative w-full'>
            <input
              ref={inputRef}
              autoFocus
              type='text'
              value={value}
              onChange={e => setValue(e.target.value)}
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              onBlur={e => {
                if (!e.relatedTarget || !e.relatedTarget.closest('button')) {
                  toggleEditUsername();
                  setValue(user.name);
                  resetErrors();
                }
              }}
            />
            <button
              className='absolute opacity-60 text-xl right-1 bottom-1 z-40 bg-gray-150 hover:bg-gray-300 rounded-lg p-1'
              type='submit'
              onClick={handleSubmit}>
              <Icon type='enter' className='text-xl' />
            </button>
          </form>
        ) : (
          <div className='flex items-center space-x-2'>
            <span className='text-base text-black'>{user.name}</span>
            <button
              onClick={() => toggleEditUsername()}
              className='flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl'>
              <Icon type='edit' className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>
      {formErrors.username && <p className='mt-1 text-sm text-red-600'>{formErrors.username}</p>}
    </div>
  );
});
