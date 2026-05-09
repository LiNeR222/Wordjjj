import { FC, PropsWithChildren } from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import styles from "./modal.module.css";
import { ModalProps } from "./types";
import clsx from "clsx";

export const Modal: FC<PropsWithChildren<ModalProps>> = ({
  open,
  onChange,
  children,
  className,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={clsx(styles.popup, className)}>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
