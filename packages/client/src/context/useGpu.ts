import { devtools } from 'zustand/middleware';
import { create as createStore } from 'zustand';
import { create as createEngine } from '@zd/engine';

export interface ContextStore {
  canvas: HTMLCanvasElement;
  engine: unknown;
  state: {};
  actions: {
    initialize: (canvas: HTMLCanvasElement) => Promise<void>;
  };
}

export const useGpu = createStore<ContextStore>()(
  devtools(
    (set, get) => ({
      canvas: null as never,
      engine: null as never,
      state: {},
      actions: {
        initialize: async canvas => {
          const engine = await createEngine(canvas);

          set({ engine, canvas });
        },
      },
    }),
    {
      store: 'context',
      name: 'context',
      serialize: true,
      enabled: true,
    },
  ),
);
