import ChainMap from './ChainMap.ts';
import { createRenderContext } from './RenderContext.ts';

class RenderContexts {
  constructor() {
    this.chainMaps = {};
  }

  get(scene, camera, renderTarget = null) {
    const chainKey = [scene, camera];
    const attachmentState =
      renderTarget === null
        ? 'default'
        : `${renderTarget.texture.format}:${renderTarget.samples}:${renderTarget.depthBuffer}:${renderTarget.stencilBuffer}`;

    const chainMap = this.getChainMap(attachmentState);

    let context = chainMap.get(chainKey);

    if (!context) {
      context = createRenderContext();
      chainMap.set(chainKey, context);
    }

    if (renderTarget) context.sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;

    return context;
  }

  getChainMap(attachmentState) {
    return this.chainMaps[attachmentState] || (this.chainMaps[attachmentState] = new ChainMap());
  }

  dispose() {
    this.chainMaps = {};
  }
}

export default RenderContexts;
