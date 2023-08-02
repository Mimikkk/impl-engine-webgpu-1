import { useCallback, useEffect, useId, useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import cx from 'classnames';
import { block } from 'million/react';

export interface CheckboxProps {
  id?: string;
  label?: string;
  value: boolean;
  onChange?: (value: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  class?: string;
}

export const Checkbox = block<CheckboxProps>(({ id, value: originalValue, onChange, label, ...props }) => {
  const [value, setValue] = useState(originalValue);
  id = id || useId();

  useEffect(() => {
    if (value === originalValue) return;
    setValue(originalValue);
  }, [originalValue]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange!(event.target.checked, event);
      setValue(event.target.checked);
    },
    [onChange],
  );

  return (
    <div className={cx('focus-within:text-indigo-800 flex items-center gap-1', props.class)}>
      <input
        className="w-4 h-4"
        id={id}
        type="checkbox"
        checked={value}
        readOnly={!onChange}
        onChange={onChange ? handleChange : undefined}
      />
      <label htmlFor={id} className="hover:text-indigo-700 transition-all">
        {label}
      </label>
    </div>
  );
});
