import { MenuItemWithIcon, MenuProps } from '../types';

export const getIconByKey = (menuItems: MenuProps['items'], selectedKey: string) => {
  if (!menuItems) return null;

  const selectedItem = menuItems.find((item): item is MenuItemWithIcon => !!item && item.key === selectedKey);

  return selectedItem?.icon || null;
};
