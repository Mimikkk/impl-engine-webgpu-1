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
} from '../Three.js';

import { createMipMapper } from './createMipMapper.js';

const _compareToWebGPU = {
  [NeverCompare]: 'never',
  [LessCompare]: 'less',
  [EqualCompare]: 'equal',
  [LessEqualCompare]: 'less-equal',
  [GreaterCompare]: 'greater',
  [GreaterEqualCompare]: 'greater-equal',
  [AlwaysCompare]: 'always',
  [NotEqualCompare]: 'not-equal',
};

export const createTexturer = backend => {
  const findFormat = texture => {
    const { format, type, colorSpace } = texture;

    if (texture.isFramebufferTexture) return GPUTextureFormat.BGRA8Unorm;

    if (texture.isCompressedTexture)
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

  return new (class {
    constructor() {
      this.mipmapUtils = null;
      this.defaultTexture = null;
    }

    createSampler = texture => {
      const device = backend.device;

      const textureGPU = backend.get(texture);

      const samplerDescriptorGPU = {
        addressModeU: this._convertAddressMode(texture.wrapS),
        addressModeV: this._convertAddressMode(texture.wrapT),
        addressModeW: this._convertAddressMode(texture.wrapR),
        magFilter: this._convertFilterMode(texture.magFilter),
        minFilter: this._convertFilterMode(texture.minFilter),
        mipmapFilter: this._convertFilterMode(texture.minFilter),
        maxAnisotropy: texture.anisotropy,
      };

      if (texture.isDepthTexture && texture.compareFunction !== null) {
        samplerDescriptorGPU.compare = _compareToWebGPU[texture.compareFunction];
      }

      textureGPU.sampler = device.createSampler(samplerDescriptorGPU);
    };
    createDefaultTexture = texture => {
      let textureGPU;

      if (texture.isCubeTexture) {
        textureGPU = this._getDefaultCubeTextureGPU();
      } else {
        textureGPU = this._getDefaultTextureGPU();
      }

      backend.get(texture).texture = textureGPU;
    };
    createTexture = (texture, options = {}) => {
      const textureData = backend.get(texture);

      if (textureData.initialized) {
        throw new Error('WebGPUTextureUtils: Texture already initialized.');
      }

      const { width, height, depth } = this._getSize(texture);

      const needsMipmaps = this._needsMipmaps(texture);
      const dimension = findDimension(texture);
      const mipLevelCount = findMipLevelCount(texture, width, height, needsMipmaps);
      const format = texture.internalFormat || findFormat(texture);

      const sampleCount = options.sampleCount !== undefined ? options.sampleCount : 1;
      const primarySampleCount = texture.isRenderTargetTexture ? 1 : sampleCount;

      let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC;

      if (texture.isCompressedTexture !== true) {
        usage |= GPUTextureUsage.RENDER_ATTACHMENT;
      }

      const textureDescriptorGPU = {
        label: texture.name,
        size: {
          width: width,
          height: height,
          depthOrArrayLayers: depth,
        },
        mipLevelCount: mipLevelCount,
        sampleCount: primarySampleCount,
        dimension: dimension,
        format: format,
        usage: usage,
      };

      // texture creation

      if (texture.isVideoTexture) {
        const video = texture.source.data;
        const videoFrame = new VideoFrame(video);

        textureDescriptorGPU.size.width = videoFrame.displayWidth;
        textureDescriptorGPU.size.height = videoFrame.displayHeight;

        videoFrame.close();

        textureData.externalTexture = video;
      } else {
        if (format === undefined) {
          console.warn('WebGPURenderer: Texture format not supported.');

          return this.createDefaultTexture(texture);
        }

        textureData.texture = backend.device.createTexture(textureDescriptorGPU);
      }

      if (texture.isRenderTargetTexture && sampleCount > 1) {
        const msaaTextureDescriptorGPU = Object.assign({}, textureDescriptorGPU);

        msaaTextureDescriptorGPU.label = msaaTextureDescriptorGPU.label + '-msaa';
        msaaTextureDescriptorGPU.sampleCount = sampleCount;

        textureData.msaaTexture = backend.device.createTexture(msaaTextureDescriptorGPU);
      }

      textureData.initialized = true;

      textureData.needsMipmaps = needsMipmaps;
      textureData.textureDescriptorGPU = textureDescriptorGPU;
    };
    destroyTexture = texture => {
      const textureData = backend.get(texture);

      textureData.texture.destroy();

      if (textureData.msaaTexture !== undefined) textureData.msaaTexture.destroy();

      backend.delete(texture);
    };
    destroySampler = texture => {
      const textureData = backend.get(texture);

      delete textureData.sampler;
    };
    generateMipmaps = texture => {
      const textureData = backend.get(texture);

      if (texture.isCubeTexture) {
        for (let i = 0; i < 6; i++) {
          this._generateMipmaps(textureData.texture, textureData.textureDescriptorGPU, i);
        }
      } else {
        this._generateMipmaps(textureData.texture, textureData.textureDescriptorGPU);
      }
    };
    updateTexture = texture => {
      const textureData = backend.get(texture);

      const { needsMipmaps, textureDescriptorGPU } = textureData;

      if (textureDescriptorGPU === undefined)
        // unsupported texture format
        return;

      // transfer texture data

      if (texture.isDataTexture || texture.isDataArrayTexture || texture.isData3DTexture) {
        this._copyBufferToTexture(texture.image, textureData.texture, textureDescriptorGPU, needsMipmaps);
      } else if (texture.isCompressedTexture) {
        this._copyCompressedBufferToTexture(texture.mipmaps, textureData.texture, textureDescriptorGPU);
      } else if (texture.isCubeTexture) {
        if (texture.image.length === 6) {
          this._copyCubeMapToTexture(texture.image, texture, textureData.texture, textureDescriptorGPU, needsMipmaps);
        }
      } else if (texture.isRenderTargetTexture) {
        if (needsMipmaps === true) this._generateMipmaps(textureData.texture, textureDescriptorGPU);
      } else if (texture.isVideoTexture) {
        textureData.externalTexture = texture.source.data;
      } else if (texture.image !== null) {
        this._copyImageToTexture(texture.image, texture, textureData.texture, textureDescriptorGPU, needsMipmaps);
      } else {
        console.warn('WebGPUTextureUtils: Unable to update texture.');
      }

      //

      textureData.version = texture.version;

      if (texture.onUpdate) texture.onUpdate(texture);
    };
    copyTextureToBuffer = async (texture, x, y, width, height) => {
      const device = backend.device;

      const textureData = backend.get(texture);
      const textureGPU = textureData.texture;
      const format = textureData.textureDescriptorGPU.format;
      const bytesPerTexel = findBytesPerTexel(format);

      const readBuffer = device.createBuffer({
        size: width * height * bytesPerTexel,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });

      const encoder = device.createCommandEncoder();

      encoder.copyTextureToBuffer(
        {
          texture: textureGPU,
          origin: { x, y },
        },
        {
          buffer: readBuffer,
          bytesPerRow: width * bytesPerTexel,
        },
        {
          width: width,
          height: height,
        },
      );

      const typedArrayType = findTypedArrayType(format);

      device.queue.submit([encoder.finish()]);

      await readBuffer.mapAsync(GPUMapMode.READ);

      const buffer = readBuffer.getMappedRange();

      return new typedArrayType(buffer);
    };

    _isEnvironmentTexture = texture => {
      const mapping = texture.mapping;

      return (
        mapping === EquirectangularReflectionMapping ||
        mapping === EquirectangularRefractionMapping ||
        mapping === CubeReflectionMapping ||
        mapping === CubeRefractionMapping
      );
    };
    _getDefaultTextureGPU = () => {
      let defaultTexture = this.defaultTexture;

      if (defaultTexture === null) {
        const texture = new Texture();
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;

        this.createTexture(texture);

        this.defaultTexture = defaultTexture = texture;
      }

      return backend.get(defaultTexture).texture;
    };
    _getDefaultCubeTextureGPU = () => {
      let defaultCubeTexture = this.defaultTexture;

      if (defaultCubeTexture === null) {
        const texture = new CubeTexture();
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;

        this.createTexture(texture);

        this.defaultCubeTexture = defaultCubeTexture = texture;
      }

      return backend.get(defaultCubeTexture).texture;
    };
    _copyImageToTexture = (image, texture, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth) => {
      if (this._isHTMLImage(image)) {
        this._getImageBitmapFromHTML(image, texture).then(imageBitmap => {
          this._copyExternalImageToTexture(imageBitmap, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth);
        });
      } else {
        // assume ImageBitmap

        this._copyExternalImageToTexture(image, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth);
      }
    };
    _isHTMLImage = image =>
      (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement);
    _copyCubeMapToTexture = (images, texture, textureGPU, textureDescriptorGPU, needsMipmaps) => {
      for (let i = 0; i < 6; i++) {
        const image = images[i];

        if (image.isDataTexture) {
          this._copyBufferToTexture(image.image, textureGPU, textureDescriptorGPU, needsMipmaps, i);
        } else {
          this._copyImageToTexture(image, texture, textureGPU, textureDescriptorGPU, needsMipmaps, i);
        }
      }
    };
    _copyExternalImageToTexture = (image, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth = 0) => {
      const device = backend.device;

      device.queue.copyExternalImageToTexture(
        {
          source: image,
        },
        {
          texture: textureGPU,
          mipLevel: 0,
          origin: { x: 0, y: 0, z: originDepth },
        },
        {
          width: image.width,
          height: image.height,
          depthOrArrayLayers: 1,
        },
      );

      if (needsMipmaps) this._generateMipmaps(textureGPU, textureDescriptorGPU, originDepth);
    };
    _generateMipmaps = (textureGPU, textureDescriptorGPU, baseArrayLayer = 0) => {
      if (!this.mipmapUtils) this.mipmapUtils = createMipMapper(backend.device);

      this.mipmapUtils.generate(textureGPU, textureDescriptorGPU, baseArrayLayer);
    };
    _getImageBitmapFromHTML = (image, texture) => {
      const width = image.width;
      const height = image.height;

      const options = {};

      options.imageOrientation = texture.flipY === true ? 'flipY' : 'none';
      options.premultiplyAlpha = texture.premultiplyAlpha === true ? 'premultiply' : 'default';

      return createImageBitmap(image, 0, 0, width, height, options);
    };
    _copyBufferToTexture = (image, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth = 0) => {
      // @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()
      // @TODO: Consider to support valid buffer layouts with other formats like RGB

      const device = backend.device;

      const data = image.data;

      const bytesPerTexel = findBytesPerTexel(textureDescriptorGPU.format);
      const bytesPerRow = image.width * bytesPerTexel;

      device.queue.writeTexture(
        {
          texture: textureGPU,
          mipLevel: 0,
          origin: { x: 0, y: 0, z: originDepth },
        },
        data,
        {
          offset: 0,
          bytesPerRow,
        },
        {
          width: image.width,
          height: image.height,
          depthOrArrayLayers: image.depth !== undefined ? image.depth : 1,
        },
      );

      if (needsMipmaps === true) this._generateMipmaps(textureGPU, textureDescriptorGPU, originDepth);
    };
    _copyCompressedBufferToTexture = (mipmaps, textureGPU, textureDescriptorGPU) => {
      const device = backend.device;

      const blockData = this._getBlockData(textureDescriptorGPU.format);

      for (let i = 0; i < mipmaps.length; i++) {
        const mipmap = mipmaps[i];

        const width = mipmap.width;
        const height = mipmap.height;

        const bytesPerRow = Math.ceil(width / blockData.width) * blockData.byteLength;

        device.queue.writeTexture(
          {
            texture: textureGPU,
            mipLevel: i,
          },
          mipmap.data,
          {
            offset: 0,
            bytesPerRow,
          },
          {
            width: Math.ceil(width / blockData.width) * blockData.width,
            height: Math.ceil(height / blockData.width) * blockData.width,
            depthOrArrayLayers: 1,
          },
        );
      }
    };
    _getBlockData = format => {
      // this method is only relevant for compressed texture formats

      if (format === GPUTextureFormat.BC1RGBAUnorm || format === GPUTextureFormat.BC1RGBAUnormSRGB)
        return {
          byteLength: 8,
          width: 4,
          height: 4,
        }; // DXT1
      if (format === GPUTextureFormat.BC2RGBAUnorm || format === GPUTextureFormat.BC2RGBAUnormSRGB)
        return {
          byteLength: 16,
          width: 4,
          height: 4,
        }; // DXT3
      if (format === GPUTextureFormat.BC3RGBAUnorm || format === GPUTextureFormat.BC3RGBAUnormSRGB)
        return {
          byteLength: 16,
          width: 4,
          height: 4,
        }; // DXT5
      if (format === GPUTextureFormat.BC4RUnorm || format === GPUTextureFormat.BC4RSNorm)
        return {
          byteLength: 8,
          width: 4,
          height: 4,
        }; // RGTC1
      if (format === GPUTextureFormat.BC5RGUnorm || format === GPUTextureFormat.BC5RGSnorm)
        return {
          byteLength: 16,
          width: 4,
          height: 4,
        }; // RGTC2
      if (format === GPUTextureFormat.BC6HRGBUFloat || format === GPUTextureFormat.BC6HRGBFloat)
        return {
          byteLength: 16,
          width: 4,
          height: 4,
        }; // BPTC (float)
      if (format === GPUTextureFormat.BC7RGBAUnorm || format === GPUTextureFormat.BC7RGBAUnormSRGB)
        return {
          byteLength: 16,
          width: 4,
          height: 4,
        }; // BPTC (unorm)

      if (format === GPUTextureFormat.ETC2RGB8Unorm || format === GPUTextureFormat.ETC2RGB8UnormSRGB)
        return {
          byteLength: 8,
          width: 4,
          height: 4,
        };
      if (format === GPUTextureFormat.ETC2RGB8A1Unorm || format === GPUTextureFormat.ETC2RGB8A1UnormSRGB)
        return {
          byteLength: 8,
          width: 4,
          height: 4,
        };
      if (format === GPUTextureFormat.ETC2RGBA8Unorm || format === GPUTextureFormat.ETC2RGBA8UnormSRGB)
        return {
          byteLength: 16,
          width: 4,
          height: 4,
        };
      if (format === GPUTextureFormat.EACR11Unorm) return { byteLength: 8, width: 4, height: 4 };
      if (format === GPUTextureFormat.EACR11Snorm) return { byteLength: 8, width: 4, height: 4 };
      if (format === GPUTextureFormat.EACRG11Unorm) return { byteLength: 16, width: 4, height: 4 };
      if (format === GPUTextureFormat.EACRG11Snorm) return { byteLength: 16, width: 4, height: 4 };

      if (format === GPUTextureFormat.ASTC4x4Unorm || format === GPUTextureFormat.ASTC4x4UnormSRGB)
        return {
          byteLength: 16,
          width: 4,
          height: 4,
        };
      if (format === GPUTextureFormat.ASTC5x4Unorm || format === GPUTextureFormat.ASTC5x4UnormSRGB)
        return {
          byteLength: 16,
          width: 5,
          height: 4,
        };
      if (format === GPUTextureFormat.ASTC5x5Unorm || format === GPUTextureFormat.ASTC5x5UnormSRGB)
        return {
          byteLength: 16,
          width: 5,
          height: 5,
        };
      if (format === GPUTextureFormat.ASTC6x5Unorm || format === GPUTextureFormat.ASTC6x5UnormSRGB)
        return {
          byteLength: 16,
          width: 6,
          height: 5,
        };
      if (format === GPUTextureFormat.ASTC6x6Unorm || format === GPUTextureFormat.ASTC6x6UnormSRGB)
        return {
          byteLength: 16,
          width: 6,
          height: 6,
        };
      if (format === GPUTextureFormat.ASTC8x5Unorm || format === GPUTextureFormat.ASTC8x5UnormSRGB)
        return {
          byteLength: 16,
          width: 8,
          height: 5,
        };
      if (format === GPUTextureFormat.ASTC8x6Unorm || format === GPUTextureFormat.ASTC8x6UnormSRGB)
        return {
          byteLength: 16,
          width: 8,
          height: 6,
        };
      if (format === GPUTextureFormat.ASTC8x8Unorm || format === GPUTextureFormat.ASTC8x8UnormSRGB)
        return {
          byteLength: 16,
          width: 8,
          height: 8,
        };
      if (format === GPUTextureFormat.ASTC10x5Unorm || format === GPUTextureFormat.ASTC10x5UnormSRGB)
        return {
          byteLength: 16,
          width: 10,
          height: 5,
        };
      if (format === GPUTextureFormat.ASTC10x6Unorm || format === GPUTextureFormat.ASTC10x6UnormSRGB)
        return {
          byteLength: 16,
          width: 10,
          height: 6,
        };
      if (format === GPUTextureFormat.ASTC10x8Unorm || format === GPUTextureFormat.ASTC10x8UnormSRGB)
        return {
          byteLength: 16,
          width: 10,
          height: 8,
        };
      if (format === GPUTextureFormat.ASTC10x10Unorm || format === GPUTextureFormat.ASTC10x10UnormSRGB)
        return {
          byteLength: 16,
          width: 10,
          height: 10,
        };
      if (format === GPUTextureFormat.ASTC12x10Unorm || format === GPUTextureFormat.ASTC12x10UnormSRGB)
        return {
          byteLength: 16,
          width: 12,
          height: 10,
        };
      if (format === GPUTextureFormat.ASTC12x12Unorm || format === GPUTextureFormat.ASTC12x12UnormSRGB)
        return {
          byteLength: 16,
          width: 12,
          height: 12,
        };
    };
    _convertAddressMode = value => {
      let addressMode = GPUAddressMode.ClampToEdge;

      if (value === RepeatWrapping) {
        addressMode = GPUAddressMode.Repeat;
      } else if (value === MirroredRepeatWrapping) {
        addressMode = GPUAddressMode.MirrorRepeat;
      }

      return addressMode;
    };
    _convertFilterMode = value => {
      let filterMode = GPUFilterMode.Linear;

      if (value === NearestFilter || value === NearestMipmapNearestFilter || value === NearestMipmapLinearFilter) {
        filterMode = GPUFilterMode.Nearest;
      }

      return filterMode;
    };
    _getSize = ({ image, isCubeTexture }) => {
      if (isCubeTexture) {
        const face = image.length > 0 ? image[0].image || image[0] : null;

        return {
          width: face?.width ?? 1,
          height: face?.height ?? 1,
          depth: 6,
        };
      }

      if (image) return { width: image.width, height: image.height, depth: image?.depth ?? 1 };

      return { width: 1, height: 1, depth: 1 };
    };
    _needsMipmaps = texture =>
      this._isEnvironmentTexture(texture) ||
      (!texture.isCompressedTexture && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter);
  })();
};
