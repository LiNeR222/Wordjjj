import { Badge, Button } from "@/components/ui";
import { VideoInfoActions } from "./actions";
import { VideoInfoAuthor } from "./author";
import styles from "./info.module.css";

export const VideoInfo = () => {
  return (
    <div className={styles.wrapper}>
      <div>
        <h1 className={styles.title}>
          Khruangbin - May Ninth (Official Video)
        </h1>
        <p className={styles.views}>18.3K views · 10 months ago</p>
      </div>
      <div className={styles.actions}>
        <VideoInfoActions />
      </div>
      <div className={styles.author}>
        <VideoInfoAuthor />
      </div>
      <div className={styles.description}>
        <p>
          A STORY BY NATHANIEL MURPHY, <br />
          JEREMY HIGGINS & JENNY LUCIA MASCIA <br />
          DIRECTED BY JENNY LUCIA MASCIA...
        </p>
        <Button size="small">Развернуть...</Button>
      </div>
      <div className={styles.tags}>
        #Life #Khruangbin #Music Video #Mixed-Media #Experimental Animation
        #Short Film #Film #Animation
      </div>
      <div className={styles.categories}>
        <p className={styles.categories__title}>Категории</p>
        <div className={styles.categories__list}>
          <Badge>Base</Badge>
          <Badge color="green">2025</Badge>
          <Badge color="blue">Music</Badge>
          <Badge color="yellow">React</Badge>
        </div>
      </div>
    </div>
  );
};
