import { LinearFilter } from '../constants.js';
import { Texture } from './Texture.js';
import {
  MagnificationTextureFilter,
  Mapping,
  MinificationTextureFilter,
  PixelFormat,
  TextureDataType,
  Wrapping,
} from '../constants.js';

export class VideoTexture extends Texture {
  declare isVideoTexture: true;

  constructor(
    video: HTMLVideoElement,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    format?: PixelFormat,
    type?: TextureDataType,
    anisotropy?: number,
  ) {
    super(video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

    this.isVideoTexture = true;

    this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
    this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

    this.generateMipmaps = false;

    const scope = this;

    function updateVideo() {
      scope.needsUpdate = true;
      video.requestVideoFrameCallback(updateVideo);
    }

    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(updateVideo);
    }
  }

  clone(): VideoTexture {
    //@ts-ignore
    return new this.constructor(this.image).copy(this);
  }

  update() {
    const video = this.image! as HTMLVideoElement;
    const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

    if (hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA) {
      this.needsUpdate = true;
    }
  }
}
