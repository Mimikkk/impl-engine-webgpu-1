import { ReactComponent as WebGpu } from '@assets/icons/logos/webgpu.svg';
import { ReactComponent as GithubWhite } from '@assets/icons/logos/github-white.svg';
import { ReactComponent as GithubBlack } from '@assets/icons/logos/github-black.svg';
import { FC, useMemo } from 'react';
import cx from 'classnames';
import s from './Logo.module.scss';
import { Button } from '@components/buttons/Button/Button.js';

const logos = {
  GithubWhite: {
    Component: GithubWhite,
    width: 24,
    height: 24,
  },
  Github: {
    Component: GithubBlack,
    width: 24,
    height: 24,
  },
  WebGpu: {
    Component: WebGpu,
    width: 32,
    height: 25,
  },
} as const;

export type LogoType = keyof typeof logos;

export interface LogoProps {
  type: LogoType;
  link: string;
  class?: string;
}

export const Logo: FC<LogoProps> = ({ type, link, ...props }) => {
  const { Component, height, width } = useMemo(() => logos[type], [type]);

  return (
    <Button link={link} nopad transparent class={cx(s.logo, props.class)}>
      <Component width={height} height={width} />
    </Button>
  );
};
