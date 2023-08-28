import {
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  UnsignedByteType,
} from '../../common/Constants.js';
import { Texture } from './Texture.js';

class VideoTexture extends Texture {
  isVideoTexture: boolean;
  constructor(
    video: any = Texture.DEFAULT_IMAGE,
    mapping: number = Texture.DEFAULT_MAPPING,
    wrapS: number = ClampToEdgeWrapping,
    wrapT: number = ClampToEdgeWrapping,
    magFilter: number = LinearFilter,
    minFilter: number = LinearMipmapLinearFilter,
    format: number = RGBAFormat,
    type: number = UnsignedByteType,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY,
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
    return new VideoTexture(this.image).copy(this);
  }

  update() {
    const video = this.image;
    const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

    if (hasVideoFrameCallback || video.readyState < video.HAVE_CURRENT_DATA) return;
    this.needsUpdate = true;
  }
}

export { VideoTexture };
