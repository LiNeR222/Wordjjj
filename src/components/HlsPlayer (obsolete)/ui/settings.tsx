import { MenuRadio, MenuRadioGroup, Settings, Submenu } from '@vime/react';
import { FC } from 'react';

interface ISettingsProps {
  playbackRate: number;
  handlePlaybackRateChange: (e: Event) => void;
}

export const SettingsMenu: FC<ISettingsProps> = ({ playbackRate, handlePlaybackRateChange }) => {
  return (
    <Settings>
      <Submenu label='Скорость воспроизведения'>
        <MenuRadioGroup value={playbackRate.toString()} onVmCheck={handlePlaybackRateChange}>
          <MenuRadio label='0.5' value='0.5' />
          <MenuRadio label='0.75' value='0.75' />
          <MenuRadio label='Нормальная скорость' value='1' />
          <MenuRadio label='1.5' value='1.5' />
          <MenuRadio label='1.75' value='1.75' />
          <MenuRadio label='2' value='2' />
        </MenuRadioGroup>
      </Submenu>
    </Settings>
  );
};
