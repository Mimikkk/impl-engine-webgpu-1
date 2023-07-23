import s from './Content.module.scss';
import { Controls } from './Canvas/Controls.js';
import { Canvas } from './Canvas/Canvas.js';

export const Content = () => {
  return (
    <main className={s.content}>
      <article className={s.playground}>
        <Controls />
        <div className="max-h-fit overflow-hidden col-span-5">
          <Canvas />
        </div>
      </article>
    </main>
  );
};
