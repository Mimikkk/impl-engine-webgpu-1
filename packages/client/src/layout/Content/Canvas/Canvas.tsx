import { useStateRef } from '@hooks/useStateRef.js';
import { useCallback, useEffect } from 'react';
import { useEvent } from 'react-use';
import { Example } from '../../../renderers/examples/examples.js';
import { useGpu } from '@context/useGpu.js';

export const Canvas = () => {
  const example = useGpu(s => s.example);
  const [[object, parent], setRef] = useStateRef(
    useCallback((node: HTMLObjectElement) => [node, node?.parentElement ?? null] as const, []),
    [],
  );

  const resize = useCallback(() => {
    if (!object || !parent) return;
    const { width, height } = parent.getBoundingClientRect();
    object.style.height = `${Math.ceil(height)}px`;
    object.style.width = `${Math.ceil(width)}px`;
  }, [object, parent]);

  useEffect(resize, [parent]);

  useEvent('resize', resize);

  return <object ref={setRef} type="text/html" data={`src/renderers/three/examples/${Example[example]}.html`} />;
};
