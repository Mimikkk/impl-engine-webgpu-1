import { Icon, IconType } from '@components/buttons/Icon/Icon.js';
import { FC, PropsWithChildren } from 'react';

export interface AlertProps extends PropsWithChildren {
  icon: IconType;
}

export const Alert: FC<AlertProps> = ({ children, icon }) => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <Icon type={icon} />
    {children}
  </div>
);
