import { FC, PropsWithChildren } from 'react';
import s from './Button.module.scss';
import cx from 'classnames';

export interface ButtonProps extends PropsWithChildren {
  onClick?: () => void | Promise<void>;
  class?: string;
  type?: 'button' | 'submit' | 'reset';
  transparent?: boolean;
  nopad?: boolean;
  link?: string;
}

export const Button: FC<ButtonProps> = ({ type = 'button', link, transparent, onClick, children, nopad, ...props }) => {
  const Tag = link ? 'a' : 'button';
  const outside = link?.startsWith('http');

  return (
    <Tag
      href={link}
      target={outside ? '_blank' : undefined}
      type={type}
      className={cx(s.button, transparent && s.transparent, nopad && s.nopad, props.class)}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
};
