import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
import { useStateRef } from '@hooks/useStateRef.js';
import { Show } from '@components/flow/Show.js';

export interface SliderProps {
  id?: string;
  onChange?: (value: number) => void;
  labels: { upper?: string; lower?: string };
  value?: number;
  min: number;
  max: number;
  step?: number;
}

export const Slider: FC<SliderProps> = ({ min, max, step, value: originalValue, labels, onChange, id = useId() }) => {
  const [value, setValue] = useState(originalValue || min);

  useEffect(() => {
    if (originalValue !== undefined && value === originalValue) return;
    setValue(originalValue!);
  }, [originalValue]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange!(event.currentTarget.valueAsNumber);
      setValue(event.currentTarget.valueAsNumber);
    },
    [onChange],
  );

  const [showControl, toggleControl] = useState(false);
  const [, setRef] = useStateRef(node => node.focus());

  return (
    <div className="focus-within:text-indigo-800">
      <Show when={labels.upper}>
        <label
          htmlFor={id}
          title={labels.upper}
          className="hover:text-indigo-700 transition-all whitespace-nowrap overflow-hidden overflow-ellipsis"
        >
          {labels.upper}
        </label>
      </Show>
      <div className="grid grid-cols-4 h-7 items-center gap-1">
        {showControl ? (
          <input
            ref={setRef}
            onBlur={() => toggleControl(false)}
            onKeyDown={event => event.key === 'Escape' && toggleControl(false)}
            onChange={event => {
              const value = event.currentTarget.valueAsNumber;

              if (Number.isNaN(value) || value < min) event.currentTarget.valueAsNumber = min;
              if (value > max) event.currentTarget.valueAsNumber = max;

              handleChange(event);
            }}
            value={value}
            className="w-full rounded-sm border border-indigo-300 hover:border-indigo-500 focus:border-indigo-700 transition-all outline-0 px-0.5"
            type="number"
            min={min}
            max={max}
            step={step}
          />
        ) : (
          <label
            tabIndex={0}
            onKeyDown={event => event.key === 'Enter' && toggleControl(true)}
            onClick={() => toggleControl(true)}
            htmlFor={id}
            title={`${value}`}
            className="w-full whitespace-nowrap overflow-hidden overflow-ellipsis hover:text-indigo-700 transition-all"
          >
            {value}:
          </label>
        )}
        <input
          id={id}
          className="w-full col-span-3"
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          value={value}
          type="range"
        />
      </div>
      <Show when={labels.lower}>
        <label
          htmlFor={id}
          title={labels.lower}
          className="hover:text-indigo-700 transition-all whitespace-nowrap overflow-hidden overflow-ellipsis"
        >
          {labels.lower}
        </label>
      </Show>
    </div>
  );
};
