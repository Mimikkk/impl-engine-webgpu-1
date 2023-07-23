import { useStateRef } from '@hooks/useStateRef.js';
import { useCallback, useEffect } from 'react';
import { useEventListener } from 'usehooks-ts';
import { useGpu } from '@context/useGpu.js';

export const Canvas = () => {
  const [[canvas, parent], setRef] = useStateRef(
    useCallback((node: HTMLCanvasElement) => [node, node?.parentElement ?? null] as const, []),
    [],
  );

  const resize = useCallback(() => {
    if (!canvas || !parent) return;

    const { width, height } = parent.getBoundingClientRect();
    Object.assign(canvas, { width: Math.ceil(width), height: Math.ceil(height) });
  }, [canvas, parent]);

  useEffect(resize, [parent]);

  useEventListener('resize', resize);

  const initialize = useGpu(state => state.actions.initialize);

  useEffect(() => {
    if (!canvas) return;

    initialize(canvas);
  }, [canvas]);

  return <canvas ref={setRef} />;
};
