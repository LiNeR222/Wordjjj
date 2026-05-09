import Avatar from "@/components/Avatar";
import styles from "./author.module.css";
import { Button } from "@/components/ui";

export const VideoInfoAuthor = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.author}>
        <Avatar size={32} title="V" />
        <p>Danil Vlasov</p>
      </div>
      <Button size="small" variant="dark">
        Подписаться
      </Button>
    </div>
  );
};
