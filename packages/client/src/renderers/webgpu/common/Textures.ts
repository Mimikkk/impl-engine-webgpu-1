import DataMap from './DataMap.js';
import { DepthStencilFormat, DepthTexture, UnsignedInt248Type, Vector2 } from 'three';
import { Renderer } from '../createRenderer.js';

const _size = new Vector2();
type Texture = any;
type RenderTarget = any;

export interface Textures {
  updateTexture: (texture: Texture, options?: {}) => void;
  get: (object: object) => any;
  updateRenderTarget: (targetCpu: RenderTarget) => void;
  dispose: () => void;
}

export const createTextures = ({ statistics, organizer }: Renderer): Textures => {
  let map = new DataMap<Texture | RenderTarget>();
  const getSize = (texture: Texture, target = _size) => {
    if (texture.isCubeTexture) {
      target.width = texture.image[0].width;
      target.height = texture.image[0].height;
    } else {
      target.width = texture.image.width;
      target.height = texture.image.height;
    }

    return target;
  };
  const destroyTexture = (texture: Texture) => {
    organizer.destroySampler(texture);
    organizer.destroyTexture(texture);
    map.delete(texture);
  };

  const updateTexture = (texture: Texture, options = {}) => {
    const textureData = map.get(texture);
    if (textureData.initialized === true && textureData.version === texture.version) return;

    const isRenderTarget = texture.isRenderTargetTexture || texture.isDepthTexture || texture.isFramebufferTexture;

    if (isRenderTarget && textureData.initialized === true) {
      // it's an update

      organizer.destroySampler(texture);
      organizer.destroyTexture(texture);
    }

    //

    if (isRenderTarget) {
      organizer.createSampler(texture);
      organizer.createTexture(texture, options);
    } else {
      const needsCreate = textureData.initialized !== true;

      if (needsCreate) organizer.createSampler(texture);

      if (texture.version > 0) {
        const image = texture.image;

        if (image === undefined) {
          console.warn('THREE.Renderer: Texture marked for update but image is undefined.');
        } else if (image.complete === false) {
          console.warn('THREE.Renderer: Texture marked for update but image is incomplete.');
        } else {
          if (textureData.isDefaultTexture === undefined || textureData.isDefaultTexture === true) {
            organizer.createTexture(texture, options);

            textureData.isDefaultTexture = false;
          }

          organizer.updateTexture(texture);
        }
      } else {
        // async update

        organizer.createDefaultTexture(texture);

        textureData.isDefaultTexture = true;
      }
    }

    // dispose handler

    if (textureData.initialized !== true) {
      textureData.initialized = true;

      //

      statistics.memory.textures++;

      // dispose

      const onDispose = () => {
        texture.removeEventListener('dispose', onDispose);

        destroyTexture(texture);

        statistics.memory.textures--;
      };

      texture.addEventListener('dispose', onDispose);
    }

    //

    textureData.version = texture.version;
  };
  const updateRenderTarget = (targetCpu: RenderTarget) => {
    const targetGpu = map.get(targetCpu);
    const sampleCount = targetCpu.samples || 1;
    const texture = targetCpu.texture;
    const size = getSize(texture);

    let depthTexture = targetCpu.depthTexture || targetGpu.depthTexture;

    if (!depthTexture) {
      depthTexture = new DepthTexture(0, 0);
      depthTexture.format = DepthStencilFormat;
      depthTexture.type = UnsignedInt248Type;
      depthTexture.image.width = size.width;
      depthTexture.image.height = size.height;
    }

    if (targetGpu.width !== size.width || size.height !== targetGpu.height) {
      texture.needsUpdate = true;
      depthTexture.needsUpdate = true;

      depthTexture.image.width = size.width;
      depthTexture.image.height = size.height;
    }

    targetGpu.width = size.width;
    targetGpu.height = size.height;
    targetGpu.texture = texture;
    targetGpu.depthTexture = depthTexture;

    if (targetGpu.sampleCount !== sampleCount) {
      texture.needsUpdate = true;
      depthTexture.needsUpdate = true;

      targetGpu.sampleCount = sampleCount;
    }

    const options = { sampleCount };
    updateTexture(texture, options);
    updateTexture(depthTexture, options);
    if (!targetGpu.initialized) {
      targetGpu.initialized = true;

      const onDispose = () => {
        targetCpu.removeEventListener('dispose', onDispose);
        destroyTexture(texture);
        destroyTexture(depthTexture);
      };

      targetCpu.addEventListener('dispose', onDispose);
    }
  };

  return {
    updateRenderTarget,
    updateTexture,
    get: (object: object) => map.get(object),
    dispose() {
      map = new DataMap();
    },
  };
};
