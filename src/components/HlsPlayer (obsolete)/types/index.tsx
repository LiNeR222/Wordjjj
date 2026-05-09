import { SerializedError } from '@/shared/lib/serialized-error';
import { Fragment } from 'hls.js';

export interface FragmentWithError {
  fragment: Fragment;
  error: SerializedError;
  load: () => Promise<void>;
}
