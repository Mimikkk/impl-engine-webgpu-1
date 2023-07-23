import s from './Footer.module.scss';
import { Logo } from '@components/buttons/Logo/Logo.js';

export const Footer = () => {
  return (
    <footer className={s.footer}>
      <div className={s.links}>
        Links:
        <Logo link="https://www.w3.org/TR/webgpu" type="WebGpu" />
        <Logo link="https://www.github.com/Mimikkk/webgpu" type="Github" />
      </div>
    </footer>
  );
};
