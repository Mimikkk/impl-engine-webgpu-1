import { useGpu } from '@context/context.js';
import { useHydrate } from '@hooks/useHydrate.js';
import { StatusBarrier } from '@components/flow/StatusBarrier.js';
import { Checkbox, Slider } from '@components/forms/forms.js';
import { Example, ExampleName } from '../../../renderers/htmls/examples.js';

export const Controls = () => {
  const hydrate = useHydrate();
  const {
    loop,
    status,
    example,
    actions: { changeExample },
  } = useGpu();

  return (
    <div className="flex flex-col h-full col-span-1 px-2 py-1 border-r bg-indigo-100 border-r-indigo-700">
      <StatusBarrier status={status}>
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
      </StatusBarrier>
      <select value={example} onChange={event => changeExample(event.currentTarget.value as ExampleName)}>
        {Object.entries(Example).map(([name, filename]) => (
          <option value={name} key={filename}>
            {name} - {filename}.html
          </option>
        ))}
      </select>
    </div>
  );
};
