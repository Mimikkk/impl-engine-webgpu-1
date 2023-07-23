import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

export interface ContextStore {
  canvas: HTMLCanvasElement;
  api: unknown;
  state: {};
  actions: {
    initialize: () => Promise<void>;
  };
}

export const useContext = create<ContextStore>()(
  devtools(
    (set, get) => ({
      canvas: null as never,
      api: null as never,
      state: {},
      actions: {
        initialize: async () => {
          return;
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
