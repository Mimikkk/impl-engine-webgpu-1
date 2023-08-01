import { useRerender } from '@hooks/useRerender.js';

export const useHydrate = () => {
  const rerender = useRerender();

  return <T>(fn: () => T) => {
    const result = fn();
    rerender();
    return result;
  };
};
