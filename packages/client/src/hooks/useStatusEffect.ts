import { type EffectCallback, useEffect } from 'react';
import { Status } from '@typings/status.js';

export interface UseStatusEffect {
  statuses: Status[];
  fn: EffectCallback;
  deps?: unknown[];
}

export const useStatusEffect = ({ statuses, fn, deps = [] }: UseStatusEffect) =>
  useEffect(() => {
    if (!Status.isSuccess(statuses)) return;

    return fn();
  }, [...statuses, ...deps]);
