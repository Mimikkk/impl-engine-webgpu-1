export interface CreateUpdateLoopOptions {
  update(deltatime: number): void;
  blend(previousBlendingFactor: number, currentBlendingFactor: number): void;
  render(deltatime: number): void;
  rendersPerSecond: number;
  updatesPerSecond: number;
  immediate?: boolean;
}
export interface CreateUpdateLoop {}

export const createUpdateLoop = ({
  rendersPerSecond = 60,
  updatesPerSecond = 50,
  immediate = true,
  update,
  blend,
  render,
}: CreateUpdateLoopOptions): CreateUpdateLoop => {
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
  const internal = {
    state: {
      render: state.render,
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

    state.deltaUpdateTimeMs = currentTimeMs - state.previousUpdateTimeMs;
    state.previousUpdateTimeMs = currentTimeMs;

    state.accumulatedUpdateTimeMs += state.deltaUpdateTimeMs;
    while (state.accumulatedUpdateTimeMs >= state.updateIntervalMs) {
      state.update(state.updateIntervalMs);
      state.accumulatedUpdateTimeMs -= state.updateIntervalMs;
      state.passedTimeMs += state.updateIntervalMs;
    }

    state.deltaRenderTimeMs = currentTimeMs - state.previousRenderTimeMs;
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
