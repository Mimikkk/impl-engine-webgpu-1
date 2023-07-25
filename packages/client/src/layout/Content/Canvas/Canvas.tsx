import { useStateRef } from '@hooks/useStateRef.js';
import { useCallback, useEffect } from 'react';
import { useAsync, useEvent } from 'react-use';
import { useGpu } from '@context/useGpu.js';
import { useStatusEffect } from '@hooks/useStatusEffect.js';

export const Canvas = () => {
  const [[canvas, parent], setRef] = useStateRef(
    useCallback((node: HTMLCanvasElement) => [node, node?.parentElement ?? null] as const, []),
    [],
  );

  const resize = useCallback(() => {
    if (!canvas || !parent) return;

    const { width, height } = parent.getBoundingClientRect();
    canvas.height = Math.ceil(height);
    canvas.width = Math.ceil(width);
  }, [canvas, parent]);

  useEffect(resize, [parent]);

  useEvent('resize', resize);

  const { actions, render, status } = useGpu();

  useAsync(async () => {
    if (!canvas) return;

    await actions.initialize(canvas);
  }, [canvas]);

  useStatusEffect({
    fn: render.triangle,
    statuses: [status],
  });

  return <canvas ref={setRef} />;
};
