import ChainMap, { Chain } from './ChainMap.js';
import RenderList from './RenderList.js';
import { Renderer } from '../createRenderer.js';

export interface RenderLists {
  get: (keys: [object, object]) => WeakMap<object, Chain<RenderList>> | RenderList;
  dispose: () => ChainMap<RenderList>;
}
export const createRenderLists = (renderer: Renderer): RenderLists => {
  let chain = new ChainMap<RenderList>();

  return {
    get: (keys: [object, object]) => {
      let link = chain.get(keys);

      if (!link) {
        link = new RenderList();
        chain.set(keys, link);
      }

      return link;
    },
    dispose: () => (chain = new ChainMap()),
  };
};
