import type { FC } from 'react';
import s from './Loader.module.scss';
import cx from 'classnames';
import type { Color, Size } from '@typings/types.js';

interface Props {
  class?: string;
  size?: Size;
  inner?: Color;
  outer?: Color;
}

export const Loader: FC<Props> = ({ inner = 'red', outer = 'indigo', size = 'md', ...props }) => (
  <div className={props.class}>
    <div className={cx(s.loader, s[`outer-${outer}`], s[`inner-${inner}`], s[`size-${size}`])} />
  </div>
);
