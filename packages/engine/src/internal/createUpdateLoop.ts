export interface CreateUpdateLoopOptions {
  update(deltatime: number): void;
  blend(previousBlendingFactor: number, currentBlendingFactor: number): void;
  render(deltatime: number): void;
  // TODO
  // rendersPerSecond: number;
  updatesPerSecond: number;
  immediate?: boolean;
}
export interface CreateUpdateLoop {}

export const createUpdateLoop = ({
  // rendersPerSecond = 60,
  updatesPerSecond = 50,
  immediate = true,
  update,
  blend,
  render,
}: CreateUpdateLoopOptions): CreateUpdateLoop => {
  const state = {
    accumulatedTimeMs: 0,
    passedTimeMs: 0,
    updatesPerSecond: updatesPerSecond,
    updateIntervalMs: 1000 / updatesPerSecond,
    // rendersPerSecond: rendersPerSecond,
    // renderIntervalMs: 1000 / rendersPerSecond,
    previousTimeMs: 0,
    deltaTimeMultiplier: 1,
    deltaTimeMs: 0,
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
      // changeRendersPerSecond: (rendersPerSecond: number) => {
      //   state.rendersPerSecond = rendersPerSecond;
      //   state.renderIntervalMs = 1000 / rendersPerSecond;
      // },
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
        state.previousTimeMs = performance.now();
        state.ongoing = true;
        state.frameId = window.requestAnimationFrame(loop);
      },
    },
  };

  // TODO - throttle to targeted FPS

  const loop = (currentTimeMs: number) => {
    state.frameId = window.requestAnimationFrame(loop);

    state.deltaTimeMs = currentTimeMs - state.previousTimeMs;
    state.deltaTimeMs = Math.min(state.deltaTimeMs, 1000);
    state.accumulatedTimeMs += state.deltaTimeMs;

    while (state.accumulatedTimeMs >= state.updateIntervalMs) {
      state.update(state.updateIntervalMs);
      state.accumulatedTimeMs -= state.updateIntervalMs;
      state.passedTimeMs += state.updateIntervalMs;
    }

    state.deltaTimeMultiplier = state.accumulatedTimeMs / state.deltaTimeMs;

    state.blend(state.deltaTimeMultiplier, 1 - state.deltaTimeMultiplier);
    state.render(state.deltaTimeMs);

    state.previousTimeMs = currentTimeMs;
  };

  if (immediate) internal.actions.start();

  return internal;
};
