import type { FC } from 'react';
import { useMemo } from 'react';
import * as outline from '@heroicons/react/24/outline';
import * as solid from '@heroicons/react/24/solid';
import type { Color, Size, UnPostfix } from '@typings/types.js';
import cx from 'classnames';
import s from './Icon.module.scss';

const variants = { outline, solid } as const;
export type IconType = UnPostfix<keyof typeof outline, 'Icon'>;

export interface IconProps {
  type: IconType;
  variant?: 'solid' | 'outline';
  class?: string;
  size?: Size;
  color?: Color;
}

export const Icon: FC<IconProps> = ({ type, size = 'md', color = 'indigo', variant = 'outline', ...props }) => {
  const Component = useMemo(() => variants[variant][`${type}Icon`], [type, variant]);

  return <Component className={cx(s.icon, s[`size-${size}`], s[`color-${color}`], props.class)} />;
};
