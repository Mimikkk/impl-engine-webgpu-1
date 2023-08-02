import { Icon, IconType } from '@components/buttons/Icon/Icon.js';
import { FC, PropsWithChildren } from 'react';
import { block } from 'million/react';

export interface AlertProps extends PropsWithChildren {
  icon: IconType;
  title?: string;
}

export const Alert: FC<AlertProps> = block<AlertProps>(({ children, icon }) => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <Icon type={icon} />
    {children}
  </div>
));
