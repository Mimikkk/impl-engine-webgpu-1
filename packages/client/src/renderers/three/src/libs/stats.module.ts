interface PanelOptions {
  foreground: string;
  background: string;
  title: string;
}

interface Panel {
  canvas: HTMLCanvasElement;
  update(value: number, maxValue: number): void;
}

const createPanel = ({ foreground, title, background }: PanelOptions): Panel => {
  let min = Infinity;
  let max = 0;
  const ratio = Math.round(window.devicePixelRatio || 1);

  const rect = { width: 80 * ratio, height: 48 * ratio };
  const text = {
    x: 3 * ratio,
    y: 2 * ratio,
    font: `bold ${9 * ratio}px Helvetica,Arial,sans-serif`,
    textBaseline: 'top',
  };
  const graph = { x: 3 * ratio, y: 15 * ratio, width: 74 * ratio, height: 30 * ratio };

  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.cssText = 'width:80px;height:48px';

  const context = canvas.getContext('2d')!;
  context.font = `bold ${9 * ratio}px Helvetica,Arial,sans-serif`;
  context.textBaseline = 'top';

  context.fillStyle = background;
  context.fillRect(0, 0, rect.width, rect.height);

  context.fillStyle = foreground;
  context.fillText(title, text.x, text.y);
  context.fillRect(graph.x, graph.y, graph.width, graph.height);

  context.fillStyle = background;
  context.globalAlpha = 0.9;
  context.fillRect(graph.x, graph.y, graph.width, graph.height);

  return {
    canvas,
    update(value: number, maxValue: number) {
      min = Math.min(min, value);
      max = Math.max(max, value);

      context.fillStyle = background;
      context.globalAlpha = 1;
      context.fillRect(0, 0, rect.width, graph.y);
      context.fillStyle = foreground;
      context.fillText(`${Math.round(value)} ${title} (${Math.round(min)}-${Math.round(max)})`, text.x, text.y);

      context.drawImage(
        canvas,
        graph.x + ratio,
        graph.y,
        graph.width - ratio,
        graph.height,
        graph.x,
        graph.y,
        graph.width - ratio,
        graph.height,
      );

      context.fillRect(graph.x + graph.width - ratio, graph.y, ratio, graph.height);

      context.fillStyle = background;
      context.globalAlpha = 0.9;
      context.fillRect(
        graph.x + graph.width - ratio,
        graph.y,
        ratio,
        Math.round((1 - value / maxValue) * graph.height),
      );
    },
  };
};

interface Stats {
  dom: HTMLDivElement;
  update(): void;
}

const createStats = (): Stats => {
  const add = (panel: Panel): Panel => {
    container.appendChild(panel.canvas);
    return panel;
  };

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';

  let startMs = performance.now();
  let lastMs = startMs;
  let frames = 0;

  const panels = {
    fps: add(createPanel({ title: 'FPS', foreground: '#0ff', background: '#002' })),
    ms: add(createPanel({ title: 'MS', foreground: '#0f0', background: '#020' })),
  };

  return {
    dom: container,
    update() {
      ++frames;
      const time = performance.now();

      panels.ms.update(time - startMs, 200);

      if (time >= lastMs + 1000) {
        panels.fps.update((frames * 1000) / (time - lastMs), 100);
        lastMs = time;
        frames = 0;
      }

      startMs = time;
    },
  };
};

export default createStats;
