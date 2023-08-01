import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Status } from '@typings/status.js';
import { useMemo } from 'react';
import { Loader } from '@components/flow/flow.js';

interface StatusBarrierProps extends PropsWithChildren {
  statuses: Status[];
  fallback?: ReactNode;
}

export const StatusBarrier: FC<StatusBarrierProps> = ({ statuses, children }) => {
  const status = useMemo(() => Status.sum(statuses), [statuses]);

  if (status === Status.Idle) {
    return null;
  }

  if (status === Status.Pending) {
    return <Loader />;
  }

  if (status === Status.Error) {
    return <div>error</div>;
  }

  return <>{children}</>;
};
