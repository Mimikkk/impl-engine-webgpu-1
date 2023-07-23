import { FC, PropsWithChildren } from 'react';
import s from './Button.module.scss';
import cx from 'classnames';
import { ButtonProps } from '@components/buttons/Button/Button.js';
import { IconProps } from '@components/buttons/Icon/Icon.js';

export interface ButtonIconProps extends ButtonProps {
  icon: IconProps;
  align?: 'left' | 'right';
}

export const ButtonIcon: FC<ButtonIconProps> = ({
  type = 'button',
  transparent = false,
  onClick,
  children,
  ...props
}) => (
  <button type={type} className={cx(s.button, transparent && s.transparent, props.class)} onClick={onClick}>
    {children}
  </button>
);
