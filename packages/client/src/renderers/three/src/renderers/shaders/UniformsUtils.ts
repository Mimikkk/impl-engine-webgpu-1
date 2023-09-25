import { LinearSRGBColorSpace } from '../../constants.js';
import Renderer from '../../common/Renderer.js';

export function cloneUniforms(src: any) {
  const dst = {};

  for (const u in src) {
    dst[u] = {};

    for (const p in src[u]) {
      const property = src[u][p];

      if (
        property &&
        (property.isColor ||
          property.isMatrix3 ||
          property.isMatrix4 ||
          property.isVector2 ||
          property.isVector3 ||
          property.isVector4 ||
          property.isTexture ||
          property.isQuaternion)
      ) {
        if (property.isRenderTargetTexture) {
          console.warn(
            'UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().',
          );
          dst[u][p] = null;
        } else {
          dst[u][p] = property.clone();
        }
      } else if (Array.isArray(property)) {
        dst[u][p] = property.slice();
      } else {
        dst[u][p] = property;
      }
    }
  }

  return dst;
}

export function mergeUniforms(uniforms: any[]) {
  const merged = {};

  for (let u = 0; u < uniforms.length; u++) {
    const tmp = cloneUniforms(uniforms[u]);

    for (const p in tmp) {
      merged[p] = tmp[p];
    }
  }

  return merged;
}

export function cloneUniformsGroups(src) {
  const dst = [];

  for (let u = 0; u < src.length; u++) {
    dst.push(src[u].clone());
  }

  return dst;
}

export function getUnlitUniformColorSpace(renderer: Renderer) {
  if (renderer.getRenderTarget() === null) {
    // https://github.com/mrdoob/three.js/pull/23937#issuecomment-1111067398
    return renderer.outputColorSpace;
  }

  return LinearSRGBColorSpace;
}

// Legacy

export namespace UniformsUtils {
  export const clone = cloneUniforms;
  export const merge = mergeUniforms;
}
