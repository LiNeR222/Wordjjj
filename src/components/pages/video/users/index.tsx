import React from "react";

import styles from "./users.module.css";
import Avatar from "@/components/Avatar";
import clsx from "clsx";

import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { Badge, Button, Menu, Tooltip } from "@/components/ui";
import { PiDotsThreeOutlineLight } from "react-icons/pi";

const VideoUserItem = () => {
  const random = Math.random() < 0.5;

  return (
    <li className={styles.list__item}>
      <div className={clsx(styles.name, styles.columnName)}>
        <Avatar size={32} title="H" />
        <div className={styles.name__info}>
          <p>Homo Sapiens</p>
          <span
            className={clsx(styles.name__status, { [styles.online]: random })}>
            {random ? "Онлайн" : "Не в сети"}
          </span>
        </div>
      </div>
      <div className={clsx(styles.time, styles.columnTime)}>
        {random ? <Badge>04:50</Badge> : <Badge color="green">Смотрит</Badge>}
      </div>
      <div className={clsx(styles.date, styles.columnDate)}>
        <Badge>11 янв. 16:30</Badge>
      </div>
      <div className={clsx(styles.referal, styles.columnReferal)}>
        {random ? <IoMdCheckmark color="rgb(102, 157, 19)" /> : <IoMdClose />}
      </div>
      <div className={clsx(styles.type, styles.columnType)}>
        {random ? (
          <Badge color="default">Зритель</Badge>
        ) : (
          <Badge color="blue">Менеджер</Badge>
        )}
      </div>
      <div className={clsx(styles.actions, styles.columnActions)}>
        <Menu
          positioner={{
            align: "end",
            side: "bottom",
          }}
          options={[
            {
              title: "Перейти",
              label: "2",
            },
            {
              title: "Заблокировать",
              label: "2",
            },
          ]}
          trigger={
            <Tooltip content="Действие">
              <Button variant="icon">
                <PiDotsThreeOutlineLight fontSize={20} />
              </Button>
            </Tooltip>
          }
        />
      </div>
    </li>
  );
};

export const VideoUsers: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>
        Пользователи <span>6</span>
      </p>
      <ul className={styles.list}>
        <div className={styles.head}>
          <p className={styles.columnName}>Имя</p>
          <p className={styles.columnTime}>Время просмотра</p>
          <p className={styles.columnDate}>Дата регистрации</p>
          <p className={styles.columnReferal}>Ваш реферал?</p>
          <p className={styles.columnType}>Тип</p>
          <p className={styles.columnActions}>Действие</p>
        </div>
        <VideoUserItem />
        <VideoUserItem />
        <VideoUserItem />
        <VideoUserItem />
        <VideoUserItem />
        <VideoUserItem />
      </ul>
    </div>
  );
};
