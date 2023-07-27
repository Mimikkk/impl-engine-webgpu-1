export interface CreateRenderLoopOptions {
  render(dt: number, state: CreateRenderLoop['state'], actions: CreateRenderLoop['actions']): void;
  framesPerSecond: number;
  immediate?: boolean;
}
export interface CreateRenderLoop {
  state: {
    get framesPerSecond(): number;
    get previousTimeMs(): number;
    get frameIntervalMs(): number;
    get deltaTimeMultiplier(): number;
    get deltaTimeMs(): number;
    get ongoing(): boolean;
    render(dt: number, state: CreateRenderLoop['state'], actions: CreateRenderLoop['actions']): void;
  };
  actions: {
    changeFps(fps: number): void;
    stop(): void;
    start(): void;
  };
}

export const createRenderLoop = ({
  framesPerSecond = 60,
  immediate = true,
  render,
}: CreateRenderLoopOptions): CreateRenderLoop => {
  const state = {
    framesPerSecond,
    frameIntervalMs: 1000 / framesPerSecond,
    previousTimeMs: performance.now(),
    deltaTimeMultiplier: 1,
    deltaTimeMs: 0,
    ongoing: true,
    render,
  };
  const internal = {
    state: {
      get previousTimeMs() {
        return state.previousTimeMs;
      },
      get framesPerSecond() {
        return state.framesPerSecond;
      },
      get frameIntervalMs() {
        return state.frameIntervalMs;
      },
      get deltaTimeMultiplier() {
        return state.deltaTimeMultiplier;
      },
      get deltaTimeMs() {
        return state.deltaTimeMs;
      },
      get ongoing() {
        return state.ongoing;
      },
      render: state.render,
    },
    actions: {
      changeFps: (fps: number) => {
        state.framesPerSecond = fps;
        state.frameIntervalMs = 1000 / fps;
      },
      stop: () => (state.ongoing = false),
      start: () => {
        state.previousTimeMs = performance.now();
        state.ongoing = true;
        window.requestAnimationFrame(loop);
      },
    },
  };
  const loop = (timeMs: number) => {
    if (!state.ongoing) return;
    window.requestAnimationFrame(loop);

    state.deltaTimeMs = timeMs - state.previousTimeMs;
    state.deltaTimeMultiplier = Math.min(1, state.deltaTimeMs / state.frameIntervalMs);

    state.render(state.deltaTimeMultiplier, internal.state, internal.actions);

    state.previousTimeMs = timeMs;
  };

  if (immediate) window.requestAnimationFrame(loop);
  return internal;
};
