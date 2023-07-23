import { useCallback, useState } from 'react';

export const useStateRef = <Element extends HTMLElement, Return, Initial>(
  process: (node: Element) => Return,
  initial: Initial = null as Initial,
) => {
  const [node, setNode] = useState<Return | Initial>(initial);

  const setRef = useCallback((node: Element) => setNode(process(node)), [process]);

  return [node, setRef] as const;
};
