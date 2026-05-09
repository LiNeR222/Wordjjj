'use client';
import { subscriptionService } from '@/entities/payment/model/subscription-service';
import { tariffStore } from '@/entities/tariff';
import { useSearchAppParams } from '@/shared/hooks';
import { Icon } from '@/shared/ui';
import { Modal } from '@/shared/ui/modal';
import { ConfigProvider, Spin } from 'antd';
import Link from 'next/link';
import { FC, useState, useEffect } from 'react';
import { LiaCrownSolid } from 'react-icons/lia';
import CONSTANTS from './config/constants.json';
import { observer } from 'mobx-react-lite';
import { message } from 'antd';

/**
 * Модальное окно для оформления Pro-подписки
 */
export const ProModal: FC = observer(() => {
  const { getSearchParamValue, editSearchParams } = useSearchAppParams();
  const isModalPro = getSearchParamValue('modal') === 'pro';
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { currentTariff, isLoading: isTariffLoading } = tariffStore;

  useEffect(() => {
    if (isModalPro) {
      tariffStore.refreshTariff();
    }
  }, [isModalPro]);

  /**
   * Обработчик оформления подписки
   */
  const handleSubscriptionPurchase = async () => {
    setIsLoading(true);
    
    try {
      const returnUrl = window.location.origin;
      
      const result = await subscriptionService.purchaseSubscription(returnUrl);
      
      if (!result.success) {
        if (result.error) {
          console.error('Ошибка при оформлении подписки:', result.error);
          messageApi.error('Не удалось оформить подписку. Попробуйте позже.');
        }
        return;
      }
      
      if (!result.redirectUrl) {
        messageApi.error('Не удалось получить платежную ссылку.');
      }
    } catch (error) {
      console.error('Ошибка при оформлении подписки:', error);
      messageApi.error('Произошла ошибка. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { borderRadiusLG: 18 } }}>
      {contextHolder}
      <Modal
        open={isModalPro}
        title={
          <span className='font-semibold text-[32px] tracking-[-0.05em]'>
            Подключите{' '}
            <span className='whitespace-nowrap inline-flex items-center'>
              Pro <LiaCrownSolid className='w-[32px] h-[32px] inline-block align-middle ml-1' />
            </span>
          </span>
        }
        closeIcon={
          <span className='bg-[#0000000D] p-[10px] rounded-[7px]'>
            <Icon type='close-button' className='w-[12px] h-[12px]' />
          </span>
        }
        onCancel={() => {
          editSearchParams('remove', ['modal']);
        }}
        footer={null}
        centered={true}
        width={500}>
        <div className='px-[10px] py-[15px]'>
          <ul className='tracking-[-0.02em] list-none pb-[30px] border-b border-[#0000001d] flex flex-col gap-y-[15px]'>
            {CONSTANTS.PRO_LIST.map((item, index) => (
              <li key={index} className='flex items-center gap-x-[7px] text-xs sm:text-sm'>
                <Icon type='check-icon' className='w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]' />
                <span className='leading-[100%] text-[15px] font-medium'>{item}</span>
              </li>
            ))}
          </ul>
          {isTariffLoading ? (
            <div className='my-[30px] flex justify-center'>
              <Spin size="large" tip="Загрузка данных тарифа..." />
            </div>
          ) : currentTariff ? (
            <div className='my-[30px] flex flex-col gap-y-[10px]'>
              <h2 className='leading-[100%] font-semibold text-[24px] tracking-[-0.05em]'>и многое другое всего за:</h2>
              <p className='leading-[100%] font-medium text-[24px] text-[#00000066] line-through tracking-[-0.05em]'>
                {currentTariff.old_price?.toLocaleString()} руб
              </p>
              <p className='leading-[100%] font-semibold text-[36px] text-black tracking-[-0.05em]'>
                {currentTariff.price?.toLocaleString()} руб
                <span className='leading-[100%] font-semibold text-[24px] text-[#00000066] tracking-[-0.05em]'>/мес</span>
              </p>
            </div>
          ) : (
            <div className='my-[30px] flex justify-center'>
              <p className='text-[16px] text-gray-500'>Не удалось загрузить данные о тарифе</p>
            </div>
          )}
          <button 
            className={`font-semibold text-base text-white w-full bg-black rounded-[12px] flex justify-center transition-all duration-500 ease-in-out transform hover:scale-[101%] ${(isLoading || !currentTariff) ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleSubscriptionPurchase}
            disabled={isLoading || !currentTariff}
          >
            <span className='flex items-center gap-x-2 py-[12px]'>
              <span className='font-semibold text-[16px]'>
                {isLoading ? 'Обработка...' : 'Оформить подписку'}
              </span>
              {currentTariff && (
                <span className='font-semibold text-[16px] text-[#FFFFFF80]'>
                  {currentTariff.price.toLocaleString()} руб/мес
                </span>
              )}
            </span>
          </button>
          <p className='leading-[100%] text-[12px] text-center mt-[15px]'>
            Удобнее оплачивать с расчетного счета? Напишите нам в{' '}
            <Link href='https://t.me/natfullinrus' className='leading-[100%] text-[12px] underline text-[#2181FF]'>
              поддержку
            </Link>
          </p>
        </div>
      </Modal>
    </ConfigProvider>
  );
});
