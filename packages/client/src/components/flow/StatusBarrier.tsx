import type { FC, PropsWithChildren, ReactNode } from 'react';
import { useMemo } from 'react';
import { Status } from '@typings/status.js';
import { Loader } from '@components/flow/flow.js';
import { block } from 'million/react';
import { Alert } from '@components/flow/Alert.js';

interface StatusBarrierProps extends PropsWithChildren {
  statuses?: Status[];
  status?: Status;
  fallback?: ReactNode;
}

export const StatusBarrier: FC<StatusBarrierProps> = ({ statuses, status, children }) => {
  status = useMemo(() => {
    const sum = statuses ? Status.sum(statuses) : Status.Success;
    if (status) return Status.sum([sum, status]);
    return sum;
  }, [status, statuses]);

  console.log(status, statuses);

  switch (status) {
    case Status.Idle:
      return null;
    case Status.Pending:
      return <Loader class="place-self-center" />;
    case Status.Error:
      return (
        <Alert icon="Fire" title="Coś poszło nie tak!">
          Odczytanie elementu nie powiodło się.
        </Alert>
      );
    default:
      return <>{children}</>;
  }
};
