import { LinearSRGBColorSpace } from '../../common/Constants.js';

export function cloneUniforms(src: any) {
  const destination: any = {};

  for (const uniform in src) {
    destination[uniform] = {};

    for (const key in src[uniform]) {
      const property = src[uniform][key];

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
          destination[uniform][key] = null;
        } else {
          destination[uniform][key] = property.clone();
        }
      } else if (Array.isArray(property)) {
        destination[uniform][key] = property.slice();
      } else {
        destination[uniform][key] = property;
      }
    }
  }

  return destination;
}

export function mergeUniforms(uniforms: any) {
  const merged: any = {};

  for (let u = 0; u < uniforms.length; u++) {
    const cloned = cloneUniforms(uniforms[u]);

    for (const key in cloned) merged[key] = cloned[key as keyof typeof cloned];
  }

  return merged;
}

export function cloneUniformsGroups(src: any) {
  const dst = [];

  for (let u = 0; u < src.length; u++) {
    dst.push(src[u].clone());
  }

  return dst;
}

export function getUnlitUniformColorSpace(renderer: any) {
  if (renderer.getRenderTarget() === null) {
    // https://github.com/mrdoob/three.js/pull/23937#issuecomment-1111067398
    return renderer.outputColorSpace;
  }

  return LinearSRGBColorSpace;
}

export const UniformsUtils = { clone: cloneUniforms, merge: mergeUniforms };
