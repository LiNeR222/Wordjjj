import { ReactNode } from 'react';
import { Align, Side } from '../../../../node_modules/@base-ui-components/react/esm/utils/useAnchorPositioning';

export type MenuProps = {
  trigger: ReactNode;
  options?: {
    icon?: ReactNode;
    title: string;
    label: string;
    onClick?: () => void;
  }[];
  positioner?: {
    side: Side;
    align: Align;
  };
};
