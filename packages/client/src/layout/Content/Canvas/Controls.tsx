import { useGpu } from '@context/context.js';
import { Loader } from '@components/flow/flow.js';
import { useHydrate } from '@hooks/useHydrate.js';

export const Controls = () => {
  const hydrate = useHydrate();
  const { loop, status } = useGpu();

  return (
    <div className="col-span-1 px-2 py-1 border-r bg-indigo-100 border-r-indigo-700">
      <Loader />
      <div>
        <input
          id="gpu"
          type="checkbox"
          checked={loop?.state.ongoing}
          onChange={event => hydrate(() => loop.actions[event.target.checked ? 'start' : 'stop']())}
        />
        <label htmlFor="gpu">nazwa</label>
      </div>
      <div>
        <label htmlFor="rps-slider">RPS:</label>
        <input
          id="rps-slider"
          type="range"
          min="0"
          max="144"
          value={loop?.state.rendersPerSecond}
          onChange={event => hydrate(() => loop.actions.changeRendersPerSecond(event.target.valueAsNumber))}
        />
      </div>
      <div>
        <label htmlFor="ups-slider">UPS</label>
        <input
          id="ups-slider"
          type="range"
          min="0"
          max="144"
          value={loop?.state.updatesPerSecond}
          onChange={event => hydrate(() => loop.actions.changeUpdatesPerSecond(event.target.valueAsNumber))}
        />
      </div>
    </div>
  );
};
