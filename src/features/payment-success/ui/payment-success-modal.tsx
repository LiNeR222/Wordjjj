'use client';

import { paymentStore } from '@/entities/payment';
import { Modal } from '@/shared/ui/modal';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, Suspense, useState } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSearchAppParams } from '@/shared/hooks';
import { message } from 'antd';
import { authStore } from '@/entities/auth/model/authStore';
import { walletStore } from '@/entities/wallet';

/**
 * Компонент для отображения результата платежа
 * Отображает модальное окно с информацией об успешном или неудачном платеже
 */
const PaymentSuccessModalContent: FC = observer(() => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { editSearchParams } = useSearchAppParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  
  /**
   * Обновляет данные пользователя и баланс кошелька после успешного платежа
   */
  const updateUserData = async () => {
    try {
      if (authStore.userStore) {
        await authStore.userStore.fetchMyProfile();
      }
      
      await walletStore.fetchBalance();
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя и баланса:', error);
    }
  };
  
  /**
   * Обрабатывает URL параметры и вызывает соответствующие методы в paymentStore
   */
  const processPaymentStatus = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const hasSuccess = searchParams.get('success') === 'true';
      const hasFail = searchParams.get('fail') === 'true';
      
      if (pathname === '/success') {
        const result = await paymentStore.confirmPaymentSuccess();
        if (!result) {
          messageApi.error('Не удалось подтвердить платеж. Пожалуйста, свяжитесь с поддержкой.');
        } else {
          await updateUserData();
        }
        router.replace('/');
      } else if (pathname === '/fail') {
        const result = await paymentStore.confirmPaymentFail();
        if (!result) {
          messageApi.error('Произошла ошибка при обработке платежа. Пожалуйста, попробуйте позже.');
        }
        router.replace('/');
      } else if (hasSuccess) {
        const result = await paymentStore.confirmPaymentSuccess();
        if (!result) {
          messageApi.error('Не удалось подтвердить платеж. Пожалуйста, свяжитесь с поддержкой.');
        } else {
          await updateUserData();
        }
        
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('success');
        
        if (newParams.toString()) {
          router.replace(`${pathname}?${newParams.toString()}`);
        } else {
          router.replace(pathname);
        }
      } else if (hasFail) {
        const result = await paymentStore.confirmPaymentFail();
        if (!result) {
          messageApi.error('Произошла ошибка при обработке платежа. Пожалуйста, попробуйте позже.');
        }
        
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('fail');
        
        if (newParams.toString()) {
          router.replace(`${pathname}?${newParams.toString()}`);
        } else {
          router.replace(pathname);
        }
      }
    } catch (error) {
      console.error('Ошибка при обработке статуса платежа:', error);
      messageApi.error('Произошла ошибка при обработке статуса платежа.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    processPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  
  /**
   * Закрывает модальное окно с результатом платежа
   */
  const handleClose = () => {
    paymentStore.closePaymentModal();
    paymentStore.reset();
  };
  
  /**
   * Перенаправляет пользователя на страницу с оформлением подписки
   */
  const handleTryAgain = () => {
    paymentStore.closePaymentModal();
    paymentStore.reset();
    editSearchParams('add', [['modal', 'pro']]);
  };
  
  const isSuccess = paymentStore.paymentStatus === 'success';
  
  return (
    <>
      {contextHolder}
      <Modal
        open={paymentStore.showPaymentModal}
        onCancel={handleClose}
        centered
        title={null}
        footer={null}
        width={400}
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.65)' },
        }}
      >
        {isSuccess ? (
          <div className="flex flex-col items-center p-6">
            <FiCheckCircle className="text-green-500 text-6xl mb-4" />
            <h2 className="text-xl font-semibold mb-2">Подписка оформлена!</h2>
            <p className="text-gray-600 text-center mb-6">
              {paymentStore.paymentSuccessMessage || 'Ваша подписка Pro успешно активирована. Теперь у вас есть доступ ко всем премиум-функциям.'}
            </p>
            <button
              onClick={handleClose}
              className="bg-black text-white font-semibold py-2 px-6 rounded-lg w-full"
            >
              Начать пользоваться
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center p-6">
            <FiXCircle className="text-red-500 text-6xl mb-4" />
            <h2 className="text-xl font-semibold mb-2">Оплата не прошла</h2>
            <p className="text-gray-600 text-center mb-6">
              {paymentStore.paymentErrorMessage || 'К сожалению, при обработке вашего платежа произошла ошибка. Пожалуйста, попробуйте еще раз.'}
              {paymentStore.paymentErrorCode && (
                <span className="block mt-2 text-sm text-gray-500">
                  Код ошибки: {paymentStore.paymentErrorCode}
                </span>
              )}
            </p>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={handleTryAgain}
                className="bg-black text-white font-semibold py-2 px-6 rounded-lg w-full"
              >
                Попробовать снова
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg w-full"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
});

/**
 * Обертка с Suspense для корректной работы в Server Components
 */
export const PaymentSuccessModal: FC = () => {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessModalContent />
    </Suspense>
  );
}; 