import { GPUAddressMode, GPUFeatureName, GPUFilterMode, GPUTextureDimension, GPUTextureFormat } from './constants.js';

import {
  AlwaysCompare,
  CubeReflectionMapping,
  CubeRefractionMapping,
  CubeTexture,
  DepthFormat,
  DepthStencilFormat,
  EqualCompare,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping,
  FloatType,
  GreaterCompare,
  GreaterEqualCompare,
  HalfFloatType,
  LessCompare,
  LessEqualCompare,
  LinearFilter,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipmapLinearFilter,
  NearestMipmapNearestFilter,
  NeverCompare,
  NotEqualCompare,
  RedFormat,
  RepeatWrapping,
  RGB_ETC2_Format,
  RGBA_ASTC_10x10_Format,
  RGBA_ASTC_10x5_Format,
  RGBA_ASTC_10x6_Format,
  RGBA_ASTC_10x8_Format,
  RGBA_ASTC_12x10_Format,
  RGBA_ASTC_12x12_Format,
  RGBA_ASTC_4x4_Format,
  RGBA_ASTC_5x4_Format,
  RGBA_ASTC_5x5_Format,
  RGBA_ASTC_6x5_Format,
  RGBA_ASTC_6x6_Format,
  RGBA_ASTC_8x5_Format,
  RGBA_ASTC_8x6_Format,
  RGBA_ASTC_8x8_Format,
  RGBA_ETC2_EAC_Format,
  RGBA_S3TC_DXT1_Format,
  RGBA_S3TC_DXT3_Format,
  RGBA_S3TC_DXT5_Format,
  RGBAFormat,
  RGFormat,
  SRGBColorSpace,
  Texture,
  UnsignedByteType,
  UnsignedInt248Type,
  UnsignedIntType,
  UnsignedShortType,
} from 'three';

import { createMipMapState } from './createMipMapState.js';

const compareMap = {
  [NeverCompare]: 'never',
  [LessCompare]: 'less',
  [EqualCompare]: 'equal',
  [LessEqualCompare]: 'less-equal',
  [GreaterCompare]: 'greater',
  [GreaterEqualCompare]: 'greater-equal',
  [AlwaysCompare]: 'always',
  [NotEqualCompare]: 'not-equal',
};
const environmentMappings = [
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping,
  CubeReflectionMapping,
  CubeRefractionMapping,
];
const filters = [NearestFilter, LinearFilter];

export const createTexturesState = backend => {
  const findFormat = ({ format, type, colorSpace, isFramebufferTexture, isCompressedTexture, internalFormat }) => {
    if (internalFormat) return internalFormat;

    if (isFramebufferTexture) return GPUTextureFormat.BGRA8Unorm;

    if (isCompressedTexture)
      switch (format) {
        case RGBA_S3TC_DXT1_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.BC1RGBAUnormSRGB : GPUTextureFormat.BC1RGBAUnorm;
        case RGBA_S3TC_DXT3_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.BC2RGBAUnormSRGB : GPUTextureFormat.BC2RGBAUnorm;
        case RGBA_S3TC_DXT5_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.BC3RGBAUnormSRGB : GPUTextureFormat.BC3RGBAUnorm;
        case RGB_ETC2_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ETC2RGB8UnormSRGB : GPUTextureFormat.ETC2RGB8Unorm;
        case RGBA_ETC2_EAC_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ETC2RGBA8UnormSRGB : GPUTextureFormat.ETC2RGBA8Unorm;
        case RGBA_ASTC_4x4_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC4x4UnormSRGB : GPUTextureFormat.ASTC4x4Unorm;
        case RGBA_ASTC_5x4_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC5x4UnormSRGB : GPUTextureFormat.ASTC5x4Unorm;
        case RGBA_ASTC_5x5_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC5x5UnormSRGB : GPUTextureFormat.ASTC5x5Unorm;
        case RGBA_ASTC_6x5_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC6x5UnormSRGB : GPUTextureFormat.ASTC6x5Unorm;
        case RGBA_ASTC_6x6_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC6x6UnormSRGB : GPUTextureFormat.ASTC6x6Unorm;
        case RGBA_ASTC_8x5_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC8x5UnormSRGB : GPUTextureFormat.ASTC8x5Unorm;
        case RGBA_ASTC_8x6_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC8x6UnormSRGB : GPUTextureFormat.ASTC8x6Unorm;
        case RGBA_ASTC_8x8_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC8x8UnormSRGB : GPUTextureFormat.ASTC8x8Unorm;
        case RGBA_ASTC_10x5_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC10x5UnormSRGB : GPUTextureFormat.ASTC10x5Unorm;
        case RGBA_ASTC_10x6_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC10x6UnormSRGB : GPUTextureFormat.ASTC10x6Unorm;
        case RGBA_ASTC_10x8_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC10x8UnormSRGB : GPUTextureFormat.ASTC10x8Unorm;
        case RGBA_ASTC_10x10_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC10x10UnormSRGB : GPUTextureFormat.ASTC10x10Unorm;
        case RGBA_ASTC_12x10_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC12x10UnormSRGB : GPUTextureFormat.ASTC12x10Unorm;
        case RGBA_ASTC_12x12_Format:
          return colorSpace === SRGBColorSpace ? GPUTextureFormat.ASTC12x12UnormSRGB : GPUTextureFormat.ASTC12x12Unorm;
        default:
          console.error('WebGPURenderer: Unsupported texture format.', format);
      }

    switch (format) {
      case RGBAFormat:
        switch (type) {
          case UnsignedByteType:
            return colorSpace === SRGBColorSpace ? GPUTextureFormat.RGBA8UnormSRGB : GPUTextureFormat.RGBA8Unorm;
          case HalfFloatType:
            return GPUTextureFormat.RGBA16Float;
          case FloatType:
            return GPUTextureFormat.RGBA32Float;
          default:
            console.error('WebGPURenderer: Unsupported texture type with RGBAFormat.', type);
        }
        break;
      case RedFormat:
        switch (type) {
          case UnsignedByteType:
            return GPUTextureFormat.R8Unorm;
          case HalfFloatType:
            return GPUTextureFormat.R16Float;
          case FloatType:
            return GPUTextureFormat.R32Float;
          default:
            console.error('WebGPURenderer: Unsupported texture type with RedFormat.', type);
        }
        break;
      case RGFormat:
        switch (type) {
          case UnsignedByteType:
            return GPUTextureFormat.RG8Unorm;
          case HalfFloatType:
            return GPUTextureFormat.RG16Float;
          case FloatType:
            return GPUTextureFormat.RG32Float;
          default:
            console.error('WebGPURenderer: Unsupported texture type with RGFormat.', type);
        }
        break;
      case DepthFormat:
        switch (type) {
          case UnsignedShortType:
            return GPUTextureFormat.Depth16Unorm;
          case UnsignedIntType:
            return GPUTextureFormat.Depth24Plus;
          case FloatType:
            return GPUTextureFormat.Depth32Float;
          default:
            console.error('WebGPURenderer: Unsupported texture type with DepthFormat.', type);
        }
        break;
      case DepthStencilFormat:
        switch (type) {
          case UnsignedInt248Type:
            return GPUTextureFormat.Depth24PlusStencil8;
          case FloatType:
            if (!backend.device.features.has(GPUFeatureName.Depth32FloatStencil8))
              console.error(
                'WebGPURenderer: Depth textures with DepthStencilFormat + FloatType can only be used with the "depth32float-stencil8" GPU feature.',
              );

            return GPUTextureFormat.Depth32FloatStencil8;
          default:
            console.error('WebGPURenderer: Unsupported texture type with DepthStencilFormat.', type);
        }
        break;
      default:
        console.error('WebGPURenderer: Unsupported texture format.', format);
    }
  };
  const findBytesPerTexel = format => {
    switch (format) {
      case GPUTextureFormat.R8Unorm:
        return 1;
      case GPUTextureFormat.R16Float:
      case GPUTextureFormat.RG8Unorm:
        return 2;
      case GPUTextureFormat.RG16Float:
      case GPUTextureFormat.R32Float:
      case GPUTextureFormat.RGBA8UnormSRGB:
      case GPUTextureFormat.RGBA8Unorm:
        return 4;
      case GPUTextureFormat.RG32Float:
      case GPUTextureFormat.RGBA16Float:
        return 8;
      case GPUTextureFormat.RGBA32Float:
        return 16;
    }
  };
  const findTypedArrayType = format => {
    switch (format) {
      case GPUTextureFormat.R8Uint:
      case GPUTextureFormat.R8Unorm:
      case GPUTextureFormat.RG8Uint:
      case GPUTextureFormat.RG8Unorm:
      case GPUTextureFormat.RGBA8Uint:
      case GPUTextureFormat.RGBA8Unorm:
        return Uint8Array;
      case GPUTextureFormat.R8Sint:
      case GPUTextureFormat.R8Snorm:
      case GPUTextureFormat.RG8Sint:
      case GPUTextureFormat.RG8Snorm:
      case GPUTextureFormat.RGBA8Sint:
      case GPUTextureFormat.RGBA8Snorm:
        return Int8Array;
      case GPUTextureFormat.R16Sint:
      case GPUTextureFormat.RG16Sint:
      case GPUTextureFormat.RGBA16Sint:
        return Int16Array;
      case GPUTextureFormat.R16Uint:
      case GPUTextureFormat.RG16Uint:
      case GPUTextureFormat.RGBA16Uint:
        return Uint16Array;
      case GPUTextureFormat.R32Float:
      case GPUTextureFormat.RG32Float:
      case GPUTextureFormat.RGBA32Float:
        return Float32Array;
      case GPUTextureFormat.R32Sint:
      case GPUTextureFormat.RG32Sint:
      case GPUTextureFormat.RGBA32Sint:
        return Int32Array;
      case GPUTextureFormat.R32Uint:
      case GPUTextureFormat.RG32Uint:
      case GPUTextureFormat.RGBA32Uint:
        return Uint32Array;
      default:
        console.error('WebGPURenderer: Unsupported texture format.', format);
    }
  };
  const findDimension = ({ isData3DTexture }) =>
    isData3DTexture ? GPUTextureDimension.ThreeD : GPUTextureDimension.TwoD;
  const findMipLevelCount = (texture, width, height, needsMipmaps) => {
    if (texture.isCompressedTexture) return texture.mipmaps.length;
    if (needsMipmaps) return Math.floor(Math.log2(Math.max(width, height))) + 1;
    return 1;
  };

  // texture utilities ( should be inside texture as variables )
  const findBlockSize = format => {
    switch (format) {
      case GPUTextureFormat.BC1RGBAUnorm:
      case GPUTextureFormat.BC1RGBAUnormSRGB:
      case GPUTextureFormat.BC4RUnorm:
      case GPUTextureFormat.BC4RSnorm:
      case GPUTextureFormat.ETC2RGB8Unorm:
      case GPUTextureFormat.ETC2RGB8UnormSRGB:
      case GPUTextureFormat.ETC2RGB8A1Unorm:
      case GPUTextureFormat.ETC2RGB8A1UnormSRGB:
      case GPUTextureFormat.EACR11Unorm:
      case GPUTextureFormat.EACR11Snorm:
        return { byteLength: 8, width: 4, height: 4 };
      case GPUTextureFormat.BC2RGBAUnorm:
      case GPUTextureFormat.BC2RGBAUnormSRGB:
      case GPUTextureFormat.BC3RGBAUnorm:
      case GPUTextureFormat.BC3RGBAUnormSRGB:
      case GPUTextureFormat.BC5RGUnorm:
      case GPUTextureFormat.BC5RGSnorm:
      case GPUTextureFormat.BC6HRGBUFloat:
      case GPUTextureFormat.BC6HRGBFloat:
      case GPUTextureFormat.BC7RGBAUnorm:
      case GPUTextureFormat.BC7RGBAUnormSRGB:
      case GPUTextureFormat.ASTC4x4Unorm:
      case GPUTextureFormat.ASTC4x4UnormSRGB:
      case GPUTextureFormat.ETC2RGBA8Unorm:
      case GPUTextureFormat.ETC2RGBA8UnormSRGB:
      case GPUTextureFormat.EACRG11Unorm:
      case GPUTextureFormat.EACRG11Snorm:
        return { byteLength: 16, width: 4, height: 4 };
      case GPUTextureFormat.ASTC5x4Unorm:
      case GPUTextureFormat.ASTC5x4UnormSRGB:
        return { byteLength: 16, width: 5, height: 4 };
      case GPUTextureFormat.ASTC5x5Unorm:
      case GPUTextureFormat.ASTC5x5UnormSRGB:
        return { byteLength: 16, width: 5, height: 5 };
      case GPUTextureFormat.ASTC6x5Unorm:
      case GPUTextureFormat.ASTC6x5UnormSRGB:
        return { byteLength: 16, width: 6, height: 5 };
      case GPUTextureFormat.ASTC6x6Unorm:
      case GPUTextureFormat.ASTC6x6UnormSRGB:
        return { byteLength: 16, width: 6, height: 6 };
      case GPUTextureFormat.ASTC8x5Unorm:
      case GPUTextureFormat.ASTC8x5UnormSRGB:
        return { byteLength: 16, width: 8, height: 5 };
      case GPUTextureFormat.ASTC8x6Unorm:
      case GPUTextureFormat.ASTC8x6UnormSRGB:
        return { byteLength: 16, width: 8, height: 6 };
      case GPUTextureFormat.ASTC8x8Unorm:
      case GPUTextureFormat.ASTC8x8UnormSRGB:
        return { byteLength: 16, width: 8, height: 8 };
      case GPUTextureFormat.ASTC10x5Unorm:
      case GPUTextureFormat.ASTC10x5UnormSRGB:
        return { byteLength: 16, width: 10, height: 5 };
      case GPUTextureFormat.ASTC10x6Unorm:
      case GPUTextureFormat.ASTC10x6UnormSRGB:
        return { byteLength: 16, width: 10, height: 6 };
      case GPUTextureFormat.ASTC10x8Unorm:
      case GPUTextureFormat.ASTC10x8UnormSRGB:
        return { byteLength: 16, width: 10, height: 8 };
      case GPUTextureFormat.ASTC10x10Unorm:
      case GPUTextureFormat.ASTC10x10UnormSRGB:
        return { byteLength: 16, width: 10, height: 10 };
      case GPUTextureFormat.ASTC12x10Unorm:
      case GPUTextureFormat.ASTC12x10UnormSRGB:
        return { byteLength: 16, width: 12, height: 10 };
      case GPUTextureFormat.ASTC12x12Unorm:
      case GPUTextureFormat.ASTC12x12UnormSRGB:
        return { byteLength: 16, width: 12, height: 12 };
    }
  };
  const findAddressMode = mode => {
    switch (mode) {
      case RepeatWrapping:
        return GPUAddressMode.Repeat;
      case MirroredRepeatWrapping:
        return GPUAddressMode.MirrorRepeat;
      default:
        return GPUAddressMode.ClampToEdge;
    }
  };
  const findFilterMode = mode => {
    switch (mode) {
      case NearestFilter:
      case NearestMipmapNearestFilter:
      case NearestMipmapLinearFilter:
        return GPUFilterMode.Nearest;
      default:
        return GPUFilterMode.Linear;
    }
  };
  const findSize = ({ image, isCubeTexture }) => {
    if (isCubeTexture) {
      image = image.length > 0 ? image[0].image || image[0] : null;

      return { width: image?.width ?? 1, height: image?.height ?? 1, depth: 6 };
    }

    return { width: image?.width ?? 1, height: image?.height ?? 1, depth: image?.depth ?? 1 };
  };
  const shouldMipmap = ({ mapping, isCompressedTexture, minFilter }) =>
    environmentMappings.includes(mapping) || !(isCompressedTexture || filters.includes(minFilter));
  const findUsage = ({ isCompressedTexture }) =>
    isCompressedTexture
      ? GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC
      : GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.RENDER_ATTACHMENT;

  const state = {
    mipmaps: null,
    texture: null,
    cubemap: null,
    depth: null,
  };

  return new (class {
    get texture() {
      if (!state.texture) {
        const texture = new Texture();
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;

        this.createTexture(texture);

        state.texture = texture;
      }

      return backend.get(state.texture).texture;
    }

    get cubemap() {
      if (!state.cubemap) {
        const texture = new CubeTexture();
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;

        this.createTexture(texture);

        state.cubemap = texture;
      }

      return backend.get(state.cubemap).texture;
    }

    get mipmaper() {
      if (!state.mipmaps) state.mipmaps = createMipMapState(backend);
      return state.mipmaps;
    }

    createSampler = textureCpu => {
      const { wrapS, wrapT, wrapR, magFilter, minFilter, anisotropy, isDepthTexture, compareFunction } = textureCpu;
      backend.get(textureCpu).sampler = backend.device.createSampler({
        addressModeU: findAddressMode(wrapS),
        addressModeV: findAddressMode(wrapT),
        addressModeW: findAddressMode(wrapR),
        magFilter: findFilterMode(magFilter),
        minFilter: findFilterMode(minFilter),
        mipmapFilter: findFilterMode(minFilter),
        maxAnisotropy: anisotropy,
        compare: isDepthTexture && compareFunction ? compareMap[compareFunction] : undefined,
      });
    };
    destroySampler = textureCpu => delete backend.get(textureCpu).sampler;
    applyTexture = textureCpu =>
      (backend.get(textureCpu).texture = textureCpu.isCubeTexture ? this.cubemap : this.texture);
    createTexture = (textureCpu, options = {}) => {
      const textureGpu = backend.get(textureCpu);

      const { width, height, depth } = findSize(textureCpu);
      const needsMipmaps = shouldMipmap(textureCpu);

      const sampleCount = options?.sampleCount ?? 1;
      const primarySampleCount = textureCpu.isRenderTargetTexture ? 1 : sampleCount;

      const textureDescriptorGpu = {
        label: textureCpu.name,
        size: { width, height, depthOrArrayLayers: depth },
        mipLevelCount: findMipLevelCount(textureCpu, width, height, needsMipmaps),
        sampleCount: primarySampleCount,
        dimension: findDimension(textureCpu),
        format: findFormat(textureCpu),
        usage: findUsage(textureCpu),
      };

      // texture creation
      if (textureCpu.isVideoTexture) {
        const video = textureCpu.source.data;
        const videoFrame = new VideoFrame(textureCpu.source.data);
        textureDescriptorGpu.size.width = videoFrame.displayWidth;
        textureDescriptorGpu.size.height = videoFrame.displayHeight;
        videoFrame.close();

        textureGpu.externalTexture = video;
      } else {
        if (!textureDescriptorGpu.format) {
          console.warn('WebGPURenderer: Texture format not supported.');

          return this.applyTexture(textureCpu);
        }

        textureGpu.texture = backend.device.createTexture(textureDescriptorGpu);
      }

      if (textureCpu.isRenderTargetTexture && sampleCount > 1) {
        textureGpu.msaaTexture = backend.device.createTexture({
          label: `${textureCpu.name}-msaa`,
          size: textureDescriptorGpu.size,
          mipLevelCount: textureDescriptorGpu.mipLevelCount,
          dimension: textureDescriptorGpu.dimension,
          format: textureDescriptorGpu.format,
          usage: textureDescriptorGpu.usage,
          sampleCount,
        });
      }

      textureGpu.needsMipmaps = needsMipmaps;
      textureGpu.textureDescriptorGpu = textureDescriptorGpu;
    };
    destroyTexture = textureCpu => {
      const textureGpu = backend.get(textureCpu);

      textureGpu.texture.destroy();
      if (textureGpu.msaaTexture) textureGpu.msaaTexture.destroy();

      backend.delete(textureCpu);
    };
    mipmap = textureCpu => {
      const { texture, textureDescriptorGpu } = backend.get(textureCpu);

      this.mipmaper.generate(texture, textureDescriptorGpu, 0);

      if (!textureCpu.isCubeTexture) return;
      for (let level = 1; level < 6; level++) this.mipmaper.generate(texture, textureDescriptorGpu, level);
    };
    updateTexture = texture => {
      const textureGpu = backend.get(texture);
      const { needsMipmaps, textureDescriptorGpu } = textureGpu;
      if (!textureDescriptorGpu) return;

      // transfer texture data
      if (texture.isDataTexture || texture.isDataArrayTexture || texture.isData3DTexture) {
        this._copyBufferToTexture(texture.image, textureGpu.texture, textureDescriptorGpu, needsMipmaps, 0);
      } else if (texture.isCompressedTexture) {
        this._copyCompressedBufferToTexture(texture.mipmaps, textureGpu.texture, textureDescriptorGpu);
      } else if (texture.isCubeTexture) {
        if (texture.image.length !== 6) return;
        this._copyCubeMapToTexture(texture.image, texture, textureGpu.texture, textureDescriptorGpu, needsMipmaps);
      } else if (texture.isRenderTargetTexture) {
        if (needsMipmaps) this.mipmaper.generate(textureGpu.texture, textureDescriptorGpu);
      } else if (texture.isVideoTexture) {
        textureGpu.externalTexture = texture.source.data;
      } else if (texture.image) {
        this._copyImageToTexture(texture.image, texture, textureGpu.texture, textureDescriptorGpu, needsMipmaps);
      } else console.warn('WebGPUTextureUtils: Unable to update texture.');

      //

      textureGpu.version = texture.version;

      if (texture.onUpdate) texture.onUpdate(texture);
    };
    copyTextureToBuffer = async (texture, x, y, width, height) => {
      const textureGpu = backend.get(texture);
      const format = textureGpu.textureDescriptorGpu.format;
      const bytesPerTexel = findBytesPerTexel(format);

      const readBuffer = backend.device.createBuffer({
        size: width * height * bytesPerTexel,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });

      const encoder = backend.device.createCommandEncoder();

      encoder.copyTextureToBuffer(
        { texture: textureGpu.texture, origin: { x, y } },
        { buffer: readBuffer, bytesPerRow: width * bytesPerTexel },
        { width, height },
      );

      backend.device.queue.submit([encoder.finish()]);
      await readBuffer.mapAsync(GPUMapMode.READ);

      const TypedArray = findTypedArrayType(format);
      return new TypedArray(readBuffer.getMappedRange());
    };
    _readImageBitmap = (image, textureCpu) =>
      createImageBitmap(image, 0, 0, image.width, image.height, {
        imageOrientation: textureCpu.flipY === true ? 'flipY' : 'none',
        premultiplyAlpha: textureCpu.premultiplyAlpha ? 'premultiply' : 'default',
      });
    _isHTMLImage = image => image instanceof HTMLImageElement || image instanceof HTMLCanvasElement;
    _copyImageToTexture = (image, textureCpu, textureGpu, textureDescriptorGpu, needsMipmaps, originDepth) => {
      if (this._isHTMLImage(image)) {
        this._readImageBitmap(image, textureCpu).then(bitmap =>
          this._copyExternalImageToTexture(bitmap, textureGpu, textureDescriptorGpu, needsMipmaps, originDepth),
        );
      } else this._copyExternalImageToTexture(image, textureGpu, textureDescriptorGpu, needsMipmaps, originDepth);
    };
    _copyCubeMapToTexture = (images, textureCpu, textureGpu, textureDescriptorGpu, needsMipmaps) =>
      images.forEach((image, level) => {
        if (image.isDataTexture) {
          this._copyBufferToTexture(image.image, textureGpu, textureDescriptorGpu, needsMipmaps, level);
          return;
        }
        this._copyImageToTexture(image, textureCpu, textureGpu, textureDescriptorGpu, needsMipmaps, level);
      });
    _copyExternalImageToTexture = (image, textureGpu, textureDescriptorGpu, needsMipmaps, depth) => {
      backend.device.queue.copyExternalImageToTexture(
        { source: image },
        { texture: textureGpu, mipLevel: 0, origin: { x: 0, y: 0, z: depth } },
        { width: image.width, height: image.height, depthOrArrayLayers: 1 },
      );

      if (needsMipmaps) this.mipmaper.generate(textureGpu, textureDescriptorGpu, depth);
    };
    _copyBufferToTexture = (
      { width, height, depth, data },
      textureGpu,
      textureDescriptorGpu,
      needsMipmaps,
      originDepth,
    ) => {
      backend.device.queue.writeTexture(
        { texture: textureGpu, mipLevel: 0, origin: { x: 0, y: 0, z: originDepth } },
        data,
        { offset: 0, bytesPerRow: width * findBytesPerTexel(textureDescriptorGpu.format) },
        { width, height, depthOrArrayLayers: depth ?? 1 },
      );

      if (needsMipmaps) this.mipmaper.generate(textureGpu, textureDescriptorGpu, originDepth);
    };
    _copyCompressedBufferToTexture = (mipmaps, textureGpu, textureDescriptorGpu) => {
      const size = findBlockSize(textureDescriptorGpu.format);

      mipmaps.forEach(({ width, height, data }, level) => {
        const bytesPerRow = Math.ceil(width / size.width) * size.byteLength;

        backend.device.queue.writeTexture(
          { texture: textureGpu, mipLevel: level },
          data,
          { offset: 0, bytesPerRow },
          {
            width: Math.ceil(width / size.width) * size.width,
            height: Math.ceil(height / size.width) * size.width,
            depthOrArrayLayers: 1,
          },
        );
      });
    };
  })();
};
