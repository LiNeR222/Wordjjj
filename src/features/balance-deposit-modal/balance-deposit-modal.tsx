'use client';

import { walletStore } from '@/entities/wallet';
import { tariffStore } from '@/entities/tariff';
import { Icon } from '@/shared/ui';
import { Modal } from '@/shared/ui/modal';
import { ConfigProvider, Form, Input, message, Button, Spin, Alert } from 'antd';
import { useSearchAppParams } from '@/shared/hooks/useSearchAppParams';
import { observer } from 'mobx-react-lite';
import { FC, useState, useEffect } from 'react';
import { FaWallet } from 'react-icons/fa';
import { MdCheckCircle, MdError } from 'react-icons/md';
import { authStore } from '@/entities/auth/model/authStore';
import { PublicOfferContent } from '@/shared/content/public-offer';

/**
 * Модальное окно для пополнения баланса
 */
export const BalanceDepositModal: FC = observer(() => {
  const { getSearchParamValue } = useSearchAppParams();
  const modalParam = getSearchParamValue('modal');
  const isModalDeposit = modalParam === 'deposit' || modalParam === 'deposit/success' || modalParam === 'deposit/fail';
  const isDepositSuccess = modalParam === 'deposit/success';
  const isDepositFail = modalParam === 'deposit/fail';
  
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { ammount, closeDepositModal, depositToWallet } = walletStore;
  const { currentTariff, isLoading: isTariffLoading, walletSurvivalInfo, isSurvivalInfoLoading } = tariffStore;
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPublicOfferVisible, setIsPublicOfferVisible] = useState(false);

  useEffect(() => {
    if (isModalDeposit) {
      tariffStore.refreshTariff();
      walletStore.refreshWalletData();
      
      if (isDepositSuccess || isDepositFail) {
        walletStore.fetchBalance();
      }
      
      const checkAuthAndInitialize = async () => {
        if (authStore.authPromise) {
          try {
            await authStore.authPromise;
          } catch (error) {
            console.warn('Ожидание авторизации завершилось ошибкой:', error);
          }
        }
        
        if (authStore.isAuth && authStore.token) {
          setIsInitialized(true);
        } else {
          setTimeout(checkAuthAndInitialize, 200);
        }
      };
      
      checkAuthAndInitialize();
    }
  }, [isModalDeposit, isDepositSuccess, isDepositFail]);

  useEffect(() => {
    if (isModalDeposit && isInitialized) {
      form.setFieldsValue({ amount: 10 });
    }
  }, [isModalDeposit, isInitialized, form]);

  const handleCloseModal = () => {
    closeDepositModal();
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('modal');
      window.history.pushState({}, '', url);
    }
  };

  const resetPaymentStatus = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('modal', 'deposit');
      window.history.pushState({}, '', url);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const showPublicOffer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPublicOfferVisible(true);
  };

  const handleDeposit = async (values: { amount: number }) => {
    if (values.amount < 10) {
      messageApi.error('Минимальная сумма пополнения 10 рублей');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await depositToWallet(values.amount);
      
      if (!result?.success) {
        messageApi.error(result?.error || 'Не удалось создать платеж. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      messageApi.error('Произошла ошибка. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const setAmount = (value: number) => {
    form.setFieldsValue({ amount: value });
  };

  const formatDaysRemaining = (days: number): string => {
    if (days <= 0) return 'Баланс исчерпан';
    if (days < 1) return 'Менее 1 дня';
    if (days === 1) return '1 день';
    if (days < 5) return `${days} дня`;
    return `${days} дней`;
  };

  const renderPaymentStatusAlert = () => {
    if (isDepositSuccess) {
      return (
        <Alert
          message="Платеж успешно выполнен"
          description={
            <div>
              <p>Ваш баланс успешно пополнен.</p>
              <p className="font-medium mt-1">Текущий баланс: {ammount?.toLocaleString() ?? 0} ₽</p>
            </div>
          }
          type="success"
          showIcon
          icon={<MdCheckCircle className="text-xl" />}
          className="mb-4"
          closable
          onClose={resetPaymentStatus}
          action={
            <Button size="small" onClick={resetPaymentStatus}>
              Скрыть
            </Button>
          }
        />
      );
    }
    
    if (isDepositFail) {
      return (
        <Alert
          message="Платеж не выполнен"
          description="К сожалению, не удалось выполнить платеж. Пожалуйста, попробуйте снова."
          type="error"
          showIcon
          icon={<MdError className="text-xl" />}
          className="mb-4"
          closable
          onClose={resetPaymentStatus}
          action={
            <Button size="small" onClick={resetPaymentStatus}>
              Скрыть
            </Button>
          }
        />
      );
    }
    
    return null;
  };

  return (
    <ConfigProvider theme={{ token: { borderRadiusLG: 18 } }}>
      {contextHolder}
      <Modal
        open={isModalDeposit}
        title={
          <span className='font-semibold text-[28px] tracking-[-0.05em] flex items-center gap-2'>
            <FaWallet className='w-[24px] h-[24px]' />
            Пополнение баланса
          </span>
        }
        closeIcon={
          <span className='bg-[#0000000D] p-[10px] rounded-[7px]'>
            <Icon type='close-button' className='w-[12px] h-[12px]' />
          </span>
        }
        onCancel={handleCloseModal}
        footer={null}
        centered={true}
        width={450}>
        <div className='px-[10px] py-[15px]'>
          {!isInitialized ? (
            <div className="flex justify-center py-8">
              <Spin size="large" tip="Загрузка данных..." />
            </div>
          ) : (
            <>
              {renderPaymentStatusAlert()}
              
              {/* Информация о тарифе */}
              <div className='mb-[20px] bg-gray-50 p-4 rounded-lg'>
                <p className='text-[18px] font-medium mb-2 flex items-center justify-between'>
                  <span>Информация о тарифе:</span>
                  {!isTariffLoading && currentTariff && (
                    <span className='text-[16px] bg-black text-white px-2 py-1 rounded-lg capitalize'>
                      {currentTariff.name}
                    </span>
                  )}
                </p>
                {isTariffLoading ? (
                  <div className="flex justify-center py-3">
                    <Spin size="small" />
                  </div>
                ) : currentTariff ? (
                  <p className="text-base">
                    Стоимость хранения: <strong>{currentTariff.storage_price_gb} ₽/Гб</strong>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Информация о тарифе недоступна</p>
                )}
              </div>
              
              <div className='mb-[20px]'>
                <p className='text-[18px] font-medium'>Текущий баланс:</p>
                <p className='text-[24px] font-bold'>{ammount?.toLocaleString() ?? 0} ₽</p>
                
                {isSurvivalInfoLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Spin size="small" />
                    <span>Расчет прогноза...</span>
                  </div>
                ) : walletSurvivalInfo ? (
                  <p className="text-gray-500 text-sm mt-1">
                    {walletSurvivalInfo.daily_storage_cost > 0 
                      ? `Хватит на: ${formatDaysRemaining(walletSurvivalInfo.days_remaining)} при текущем использовании (${walletSurvivalInfo.total_storage_gb.toFixed(2)} Гб)`
                      : 'Нет расходов на хранение'
                    }
                  </p>
                ) : null}
              </div>
              
              <Form 
                form={form} 
                onFinish={handleDeposit} 
                layout="vertical"
                initialValues={{ amount: 10 }}
              >
                <Form.Item 
                  name="amount" 
                  label="Сумма пополнения" 
                  rules={[
                    { required: true, message: 'Введите сумму пополнения' },
                    { 
                      validator: (_, value) => {
                        if (value < 10) {
                          return Promise.reject('Минимальная сумма пополнения 10 рублей');
                        }
                        return Promise.resolve();
                      } 
                    }
                  ]}
                >
                  <Input 
                    type="number" 
                    min={10} 
                    placeholder="Введите сумму (минимум 10 ₽)" 
                    suffix="₽"
                    className="rounded-[8px] p-[10px]"
                  />
                </Form.Item>
                
                {/* Кнопки для быстрого выбора суммы */}
                <div className='flex justify-between gap-2 mb-4'>
                  <Button 
                    className='flex-1 font-medium' 
                    onClick={() => setAmount(100)}
                  >
                    100 ₽
                  </Button>
                  <Button 
                    className='flex-1 font-medium' 
                    onClick={() => setAmount(1000)}
                  >
                    1 000 ₽
                  </Button>
                  <Button 
                    className='flex-1 font-medium' 
                    onClick={() => setAmount(10000)}
                  >
                    10 000 ₽
                  </Button>
                </div>
                
                <button 
                  className={`font-semibold text-base text-white w-full bg-black rounded-[12px] flex justify-center transition-all duration-500 ease-in-out transform hover:scale-[101%] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={isLoading}
                >
                  <span className='flex items-center gap-x-2 py-[12px]'>
                    <span className='font-semibold text-[16px]'>
                      {isLoading ? 'Обработка...' : 'Перейти к оплате'}
                    </span>
                  </span>
                </button>
              </Form>
              
              <p className='text-[12px] text-center mt-[15px] text-gray-500'>
                Нажимая на кнопку, вы соглашаетесь с условиями <a href="#" onClick={showPublicOffer} className='text-blue-500 hover:underline'>публичной оферты</a>
              </p>
            </>
          )}
        </div>
      </Modal>

      <Modal
        open={isPublicOfferVisible}
        title={
          <span className='font-semibold text-[24px] tracking-[-0.05em]'>
            Публичная оферта
          </span>
        }
        closeIcon={
          <span className='bg-[#0000000D] p-[10px] rounded-[7px]'>
            <Icon type='close-button' className='w-[12px] h-[12px]' />
          </span>
        }
        onCancel={() => setIsPublicOfferVisible(false)}
        footer={[
          <button 
            key="close" 
            onClick={() => setIsPublicOfferVisible(false)}
            className="font-semibold text-base text-white w-full bg-black rounded-[12px] flex justify-center transition-all duration-500 ease-in-out transform hover:scale-[101%]"
          >
            <span className='flex items-center gap-x-2 py-[12px]'>
              <span className='font-semibold text-[16px]'>
                Закрыть
              </span>
            </span>
          </button>
        ]}
        centered={true}
        width={650}
      >
        <PublicOfferContent />
      </Modal>
    </ConfigProvider>
  );
}); 