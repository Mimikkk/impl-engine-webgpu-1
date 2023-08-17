import Nodes from './nodes/Nodes.js';
export interface UpdateLoopOptions {
  update?: (deltatime: number) => void;
  blend?: (previousBlendingFactor: number, currentBlendingFactor: number) => void;
  render?: (deltatime: number) => void;
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
    get nodes(): Nodes | null;
    blend?: (previousBlendingFactor: number, currentBlendingFactor: number) => void;
    update?: (deltatime: number) => void;
    render?: (deltatime: number) => void;
  };
  actions: {
    changeUpdatesPerSecond: (updatesPerSecond: number) => void;
    changeRendersPerSecond: (rendersPerSecond: number) => void;
    changeNodes: (nodes: Nodes) => void;
    stop: () => void;
    start: () => void;
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
  const internal = {
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
    nodes: null as Nodes | null,
  };
  const state: UpdateLoop = {
    state: {
      get accumulatedUpdateTimeMs() {
        return internal.accumulatedUpdateTimeMs;
      },
      get passedTimeMs() {
        return internal.passedTimeMs;
      },
      get updatesPerSecond() {
        return internal.updatesPerSecond;
      },
      get updateIntervalMs() {
        return internal.updateIntervalMs;
      },
      get rendersPerSecond() {
        return internal.rendersPerSecond;
      },
      get renderIntervalMs() {
        return internal.renderIntervalMs;
      },
      get previousUpdateTimeMs() {
        return internal.previousUpdateTimeMs;
      },
      get previousRenderTimeMs() {
        return internal.previousRenderTimeMs;
      },
      get deltaTimeMultiplier() {
        return internal.deltaTimeMultiplier;
      },
      get deltaUpdateTimeMs() {
        return internal.deltaUpdateTimeMs;
      },
      get deltaRenderTimeMs() {
        return internal.deltaRenderTimeMs;
      },
      get frameId() {
        return internal.frameId;
      },
      get ongoing() {
        return internal.ongoing;
      },
      get nodes() {
        return internal.nodes;
      },
      update,
      render,
      blend,
    },
    actions: {
      changeRendersPerSecond: (rendersPerSecond: number) => {
        internal.rendersPerSecond = rendersPerSecond;
        internal.renderIntervalMs = 1000 / rendersPerSecond;
      },
      changeUpdatesPerSecond: (updatesPerSecond: number) => {
        internal.updatesPerSecond = updatesPerSecond;
        internal.updateIntervalMs = 1000 / updatesPerSecond;
      },
      changeNodes: (nodes: Nodes) => {
        internal.nodes = nodes;
      },
      stop: () => {
        if (!internal.ongoing) return;
        internal.ongoing = false;
        self.cancelAnimationFrame(internal.frameId);
      },
      start: () => {
        if (internal.ongoing) return;
        internal.previousUpdateTimeMs = performance.now();
        internal.previousRenderTimeMs = internal.previousUpdateTimeMs;
        internal.ongoing = true;
        internal.frameId = self.requestAnimationFrame(loop);
      },
    },
  };

  const loop = (currentTimeMs: number) => {
    internal.frameId = self.requestAnimationFrame(loop);
    internal.deltaUpdateTimeMs = Math.min(250, currentTimeMs - internal.previousUpdateTimeMs);
    internal.previousUpdateTimeMs = currentTimeMs;
    internal.accumulatedUpdateTimeMs += internal.deltaUpdateTimeMs;
    while (internal.accumulatedUpdateTimeMs >= internal.updateIntervalMs) {
      state.state.update?.(internal.updateIntervalMs);
      internal.accumulatedUpdateTimeMs -= internal.updateIntervalMs;
      internal.passedTimeMs += internal.updateIntervalMs;
    }

    internal.deltaRenderTimeMs = Math.min(250, currentTimeMs - internal.previousRenderTimeMs);
    if (internal.deltaRenderTimeMs >= internal.renderIntervalMs) {
      internal.deltaTimeMultiplier = internal.accumulatedUpdateTimeMs / internal.deltaUpdateTimeMs;
      internal.previousRenderTimeMs = currentTimeMs - (internal.deltaRenderTimeMs % internal.renderIntervalMs);
      state.state.blend?.(internal.deltaTimeMultiplier, 1 - internal.deltaTimeMultiplier);
      state.state.nodes?.nodeFrame.update();
      state.state.render?.(internal.deltaRenderTimeMs);
    }
  };

  if (immediate) state.actions.start();

  return state;
};
