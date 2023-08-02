import { Icon, IconType } from '@components/buttons/Icon/Icon.js';
import { FC, PropsWithChildren } from 'react';
import { block } from 'million/react';

export interface AlertProps extends PropsWithChildren {
  icon: IconType;
  title?: string;
}

export const Alert: FC<AlertProps> = block<AlertProps>(({ children, title, icon }) => (
  <div className="flex gap-2 px-4 py-2 bg-rose-200 rounded border border-rose-400">
    <Icon color="rose" class="bg-rose-400 rounded-xl border-rose-700 min-h-[3rem] min-w-[3rem]" type={icon} />
    <div className="flex flex-col overflow-hidden">
      <span className="text-lg font-medium">{title}</span>
      <span>{children}</span>
    </div>
  </div>
));
