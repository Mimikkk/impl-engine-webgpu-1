import s from './Content.module.scss';
import { useGpu } from '@context/context.js';

export const Content = () => (
  <main className={s.content}>
    <article className="flex border border-indigo-500 rounded w-full h-full">
      <div className="px-2 py-1 w-80 border-r bg-indigo-100 border-r-indigo-700">Canvas Controls</div>
      <canvas ref={canvas => canvas && useGpu.getState().actions.initialize(canvas)} />
    </article>
  </main>
);
