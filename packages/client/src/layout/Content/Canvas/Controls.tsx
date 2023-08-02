import { useGpu } from '@context/context.js';
import { Loader } from '@components/flow/flow.js';
import { useHydrate } from '@hooks/useHydrate.js';
import { Checkbox, Slider } from '@components/forms/forms.js';

export const Controls = () => {
  const hydrate = useHydrate();
  const { loop, status } = useGpu();

  return (
    <div className="col-span-1 px-2 py-1 border-r bg-indigo-100 border-r-indigo-700">
      <Loader />

      <Checkbox
        value={loop?.state.ongoing}
        onChange={value => hydrate(() => loop.actions[value ? 'start' : 'stop']())}
        label="Silnik właczony"
      />
      <Slider
        onChange={value => hydrate(() => loop.actions.changeRendersPerSecond(value))}
        labels={{ upper: 'Częstość rysowania [Hz]' }}
        value={loop?.state.rendersPerSecond}
        min={0}
        max={200}
      />
      <Slider
        onChange={value => hydrate(() => loop.actions.changeUpdatesPerSecond(value))}
        labels={{ upper: 'Częstość aktualizacji [Hz]' }}
        value={loop?.state.updatesPerSecond}
        min={0}
        max={200}
      />
    </div>
  );
};
