import styles from "./actions.module.css";
import { Tooltip } from "@/components/ui";
import { IoMdShare, IoMdHeartEmpty } from "react-icons/io";
import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { GoDownload } from "react-icons/go";

export const VideoInfoActions = () => {
  return (
    <div className={styles.actions}>
      <Tooltip content="Share">
        <div className="p-1">
          <IoMdShare fontSize={20} />
        </div>
      </Tooltip>
      <Tooltip content="Like">
        <div className="flex p-1 gap-1 items-center">
          <IoMdHeartEmpty fontSize={20} />
          <span className="font-medium text-sm">261</span>
        </div>
      </Tooltip>
      <Tooltip content="Download">
        <div className="p-1">
          <GoDownload fontSize={20} />
        </div>
      </Tooltip>
      <Tooltip content="Actions">
        <div className="p-1">
          <PiDotsThreeOutlineLight fontSize={20} />
        </div>
      </Tooltip>
    </div>
  );
};
