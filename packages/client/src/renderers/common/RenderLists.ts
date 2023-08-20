import ChainMap from './ChainMap.js';
import RenderList from './RenderList.js';

export const createRenderLists = () => {
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
