import { PropsWithChildren, ReactNode } from 'react';
import { block } from 'million/react';

export interface ShowProps extends PropsWithChildren {
  when?: any;
  fallback?: ReactNode;
}

export const Show = block<ShowProps>(({ when, children, fallback = null }) => {
  return when ? children : fallback;
});
