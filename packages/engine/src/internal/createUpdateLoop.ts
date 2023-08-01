export interface UpdateLoopOptions {
  update(deltatime: number): void;
  blend(previousBlendingFactor: number, currentBlendingFactor: number): void;
  render(deltatime: number): void;
  rendersPerSecond: number;
  updatesPerSecond: number;
  immediate?: boolean;
}
export interface UpdateLoop {
  state: {
    get deltaUpdateTimeMs(): number;
    get updateIntervalMs(): number;
    get frameId(): number;
    get accumulatedUpdateTimeMs(): number;
    get updatesPerSecond(): number;
    get passedTimeMs(): number;
    get previousRenderTimeMs(): number;
    get ongoing(): boolean;
    get deltaRenderTimeMs(): number;
    get rendersPerSecond(): number;
    get deltaTimeMultiplier(): number;
    get renderIntervalMs(): number;
    get previousUpdateTimeMs(): number;
    blend: (previousBlendingFactor: number, currentBlendingFactor: number) => void;
    update: (deltatime: number) => void;
    render: (deltatime: number) => void;
  };
  actions: {
    changeUpdatesPerSecond: (updatesPerSecond: number) => void;
    stop: () => void;
    start: () => void;
    changeRendersPerSecond: (rendersPerSecond: number) => void;
  };
}

export const createUpdateLoop = ({
  rendersPerSecond = 60,
  updatesPerSecond = 50,
  immediate = true,
  update,
  blend,
  render,
}: UpdateLoopOptions): UpdateLoop => {
  const state = {
    accumulatedUpdateTimeMs: 0,
    passedTimeMs: 0,
    updatesPerSecond: updatesPerSecond,
    updateIntervalMs: 1000 / updatesPerSecond,
    rendersPerSecond: rendersPerSecond,
    renderIntervalMs: 1000 / rendersPerSecond,
    previousUpdateTimeMs: 0,
    previousRenderTimeMs: 0,
    deltaTimeMultiplier: 1,
    deltaUpdateTimeMs: 0,
    deltaRenderTimeMs: 0,
    frameId: 0,
    ongoing: false,
    update,
    render,
    blend,
  };
  const internal: UpdateLoop = {
    state: {
      get accumulatedUpdateTimeMs() {
        return state.accumulatedUpdateTimeMs;
      },
      get passedTimeMs() {
        return state.passedTimeMs;
      },
      get updatesPerSecond() {
        return state.updatesPerSecond;
      },
      get updateIntervalMs() {
        return state.updateIntervalMs;
      },
      get rendersPerSecond() {
        return state.rendersPerSecond;
      },
      get renderIntervalMs() {
        return state.renderIntervalMs;
      },
      get previousUpdateTimeMs() {
        return state.previousUpdateTimeMs;
      },
      get previousRenderTimeMs() {
        return state.previousRenderTimeMs;
      },
      get deltaTimeMultiplier() {
        return state.deltaTimeMultiplier;
      },
      get deltaUpdateTimeMs() {
        return state.deltaUpdateTimeMs;
      },
      get deltaRenderTimeMs() {
        return state.deltaRenderTimeMs;
      },
      get frameId() {
        return state.frameId;
      },
      get ongoing() {
        return state.ongoing;
      },
      update: state.update,
      render: state.render,
      blend: state.blend,
    },
    actions: {
      changeRendersPerSecond: (rendersPerSecond: number) => {
        state.rendersPerSecond = rendersPerSecond;
        state.renderIntervalMs = 1000 / rendersPerSecond;
      },
      changeUpdatesPerSecond: (updatesPerSecond: number) => {
        state.updatesPerSecond = updatesPerSecond;
        state.updateIntervalMs = 1000 / updatesPerSecond;
      },
      stop: () => {
        if (!state.ongoing) return;
        state.ongoing = false;
        window.cancelAnimationFrame(state.frameId);
      },
      start: () => {
        if (state.ongoing) return;
        state.previousUpdateTimeMs = performance.now();
        state.previousRenderTimeMs = state.previousUpdateTimeMs;
        state.ongoing = true;
        state.frameId = window.requestAnimationFrame(loop);
      },
    },
  };

  const loop = (currentTimeMs: number) => {
    state.frameId = window.requestAnimationFrame(loop);

    state.deltaUpdateTimeMs = Math.min(250, currentTimeMs - state.previousUpdateTimeMs);
    state.previousUpdateTimeMs = currentTimeMs;

    state.accumulatedUpdateTimeMs += state.deltaUpdateTimeMs;
    while (state.accumulatedUpdateTimeMs >= state.updateIntervalMs) {
      state.update(state.updateIntervalMs);
      state.accumulatedUpdateTimeMs -= state.updateIntervalMs;
      state.passedTimeMs += state.updateIntervalMs;
    }

    state.deltaRenderTimeMs = Math.min(250, currentTimeMs - state.previousRenderTimeMs);
    if (state.deltaRenderTimeMs >= state.renderIntervalMs) {
      state.deltaTimeMultiplier = state.accumulatedUpdateTimeMs / state.deltaUpdateTimeMs;
      state.previousRenderTimeMs = currentTimeMs - (state.deltaRenderTimeMs % state.renderIntervalMs);

      state.blend(state.deltaTimeMultiplier, 1 - state.deltaTimeMultiplier);
      state.render(state.deltaRenderTimeMs);
    }
  };

  if (immediate) internal.actions.start();

  return internal;
};
