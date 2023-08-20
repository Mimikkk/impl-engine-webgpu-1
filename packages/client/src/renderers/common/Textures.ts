import DataMap from './DataMap.js';
import { DepthStencilFormat, DepthTexture, UnsignedInt248Type, Vector2 } from 'three';
import type { Organizer } from '../webgpu/createOrganizer.js';
import { Statistics } from './createStatistics.js';

const _size = new Vector2();
type Texture = any;
type RenderTarget = any;

export const createTextures = (backend: Organizer, info: Statistics) => {
  const map = new DataMap<Texture>();
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
    backend.destroySampler(texture);
    backend.destroyTexture(texture);
    map.delete(texture);
  };

  const updateTexture = (texture: Texture, options = {}) => {
    const textureData = map.get(texture);
    if (textureData.initialized === true && textureData.version === texture.version) return;

    const isRenderTarget = texture.isRenderTargetTexture || texture.isDepthTexture || texture.isFramebufferTexture;

    if (isRenderTarget && textureData.initialized === true) {
      // it's an update

      backend.destroySampler(texture);
      backend.destroyTexture(texture);
    }

    //

    if (isRenderTarget) {
      backend.createSampler(texture);
      backend.createTexture(texture, options);
    } else {
      const needsCreate = textureData.initialized !== true;

      if (needsCreate) backend.createSampler(texture);

      if (texture.version > 0) {
        const image = texture.image;

        if (image === undefined) {
          console.warn('THREE.Renderer: Texture marked for update but image is undefined.');
        } else if (image.complete === false) {
          console.warn('THREE.Renderer: Texture marked for update but image is incomplete.');
        } else {
          if (textureData.isDefaultTexture === undefined || textureData.isDefaultTexture === true) {
            backend.createTexture(texture, options);

            textureData.isDefaultTexture = false;
          }

          backend.updateTexture(texture);
        }
      } else {
        // async update

        backend.createDefaultTexture(texture);

        textureData.isDefaultTexture = true;
      }
    }

    // dispose handler

    if (textureData.initialized !== true) {
      textureData.initialized = true;

      //

      info.memory.textures++;

      // dispose

      const onDispose = () => {
        texture.removeEventListener('dispose', onDispose);

        destroyTexture(texture);

        info.memory.textures--;
      };

      texture.addEventListener('dispose', onDispose);
    }

    //

    textureData.version = texture.version;
  };
  function updateRenderTarget(renderTarget: RenderTarget) {
    const renderTargetData = map.get(renderTarget);
    const sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;

    const texture = renderTarget.texture;
    const size = getSize(texture);

    let depthTexture = renderTarget.depthTexture || renderTargetData.depthTexture;

    if (depthTexture === undefined) {
      depthTexture = new DepthTexture();
      depthTexture.format = DepthStencilFormat;
      depthTexture.type = UnsignedInt248Type;
      depthTexture.image.width = size.width;
      depthTexture.image.height = size.height;
    }

    if (renderTargetData.width !== size.width || size.height !== renderTargetData.height) {
      texture.needsUpdate = true;
      depthTexture.needsUpdate = true;

      depthTexture.image.width = size.width;
      depthTexture.image.height = size.height;
    }

    renderTargetData.width = size.width;
    renderTargetData.height = size.height;
    renderTargetData.texture = texture;
    renderTargetData.depthTexture = depthTexture;

    if (renderTargetData.sampleCount !== sampleCount) {
      texture.needsUpdate = true;
      depthTexture.needsUpdate = true;

      renderTargetData.sampleCount = sampleCount;
    }

    const options = { sampleCount };

    updateTexture(texture, options);
    updateTexture(depthTexture, options);

    // dispose handler

    if (renderTargetData.initialized !== true) {
      renderTargetData.initialized = true;

      // dispose

      const onDispose = () => {
        renderTarget.removeEventListener('dispose', onDispose);

        destroyTexture(texture);
        destroyTexture(depthTexture);
      };

      renderTarget.addEventListener('dispose', onDispose);
    }
  }

  return { updateRenderTarget, updateTexture };
};
