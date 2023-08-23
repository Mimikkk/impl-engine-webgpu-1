import ChainMap from './ChainMap.js';
import { createRenderContext } from './RenderContext.js';
import { Renderer } from '../webgpu/createRenderer.js';

export interface RenderContexts {
  get: (scene: any, camera: any, target?: any) => any;
  dispose: () => Map<any, any>;
}

export const createRenderContexts = (renderer: Renderer): RenderContexts => {
  let maps = new Map<string, any>();
  const get = (key: any) => {
    if (!maps.has(key)) maps.set(key, new ChainMap());
    return maps.get(key);
  };

  return {
    get(scene: any, camera: any, target: any = null) {
      const key = target
        ? `${target.texture.format}:${target.samples}:${target.depthBuffer}:${target.stencilBuffer}`
        : 'default';

      const chainKey = [scene, camera];
      const map = get(key);
      let context = map.get(chainKey);

      if (!context) {
        context = createRenderContext();
        map.set(chainKey, context);
      }

      if (target) context.sampleCount = target.samples || 1;
      return context;
    },
    dispose: () => (maps = new Map()),
  };
};
