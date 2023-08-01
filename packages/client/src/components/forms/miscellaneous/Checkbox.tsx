import { useCallback, useId, useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import cx from 'classnames';

export interface CheckboxProps {
  id?: string;
  label?: string;
  value: boolean;
  onChange?: (value: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  class?: string;
}

export const Checkbox: FC<CheckboxProps> = ({ id, value: originalValue, onChange, label, ...props }) => {
  const [value, setValue] = useState(originalValue);
  id = id || useId();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onChange!(event.target.checked, event),
    [],
  );

  return (
    <div className={cx(props.class)}>
      <input
        id={id}
        type="checkbox"
        checked={value}
        readOnly={!onChange}
        onChange={onChange ? handleChange : undefined}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
