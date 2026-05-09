import { SerializedError } from "@/shared/lib/serialized-error";
import { fragmentsStore } from "./fragments";

export class PlaylistFragment {
  public readonly videoId: number;
  public readonly sn: number;
  public readonly load: () => Promise<void>;
  public error: SerializedError | null;

  constructor(videoId: number, sn: number, load: () => Promise<void>, error: SerializedError | null = null) {
    this.videoId = videoId;
    this.sn = sn;
    this.load = load;
    this.error = error;
  }

  public delete(): void {
    fragmentsStore.deleteFragment(this.videoId, this.sn);
  }
}
