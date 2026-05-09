import { Switch as BaseSwitch } from "@base-ui-components/react/switch";
import styles from "./switch.module.css";

export const Switch = () => {
  return (
    <BaseSwitch.Root defaultChecked className={styles.switch}>
      <BaseSwitch.Thumb className={styles.thumb} />
    </BaseSwitch.Root>
  );
};
