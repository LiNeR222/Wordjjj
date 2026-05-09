import React from 'react';

import { Modal } from '../ui/modal';

import styles from './shorts.module.css';

import { Mousewheel, Pagination } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

import { AiOutlineLike } from 'react-icons/ai';
import { FaArrowDown } from 'react-icons/fa6';
import { IoMdShareAlt } from 'react-icons/io';
import { ShortItem } from './item';

export const Shorts: React.FC<{ trigger: React.ReactElement }> = ({ trigger }) => {
  const sliderRef = React.useRef<SwiperRef | null>(null);

  const handlePrev = React.useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = React.useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);
  const [open, setOpen] = React.useState(false);

  const TriggerComponent = React.cloneElement(trigger, {
    onClick: () => setOpen(true),
  });
  return (
    <>
      {TriggerComponent}
      <Modal open={open} onChange={setOpen} className={styles.modal}>
        <Swiper
          ref={sliderRef}
          direction='vertical'
          mousewheel
          slidesPerView={1.1}
          spaceBetween={30}
          centeredSlides={true}
          loop
          pagination={{
            clickable: true,
            bulletClass: styles.pagination,
          }}
          modules={[Mousewheel, Pagination]}
          className={styles.swiper}>
          <SwiperSlide className={styles.slide}>
            <ShortItem />
          </SwiperSlide>
          <SwiperSlide className={styles.slide}>
            <ShortItem />
          </SwiperSlide>
          <SwiperSlide className={styles.slide}>
            <ShortItem />
          </SwiperSlide>
        </Swiper>

        <div className={styles.actions}>
          <button onClick={handlePrev}>
            <FaArrowDown />
          </button>
          <button onClick={handleNext}>
            <FaArrowDown />
          </button>
          <button>
            <AiOutlineLike fontSize={24} />
          </button>
          <button>
            <IoMdShareAlt fontSize={24} />
          </button>
        </div>
      </Modal>
    </>
  );
};
