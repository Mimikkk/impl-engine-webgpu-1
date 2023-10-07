import { TextureNode } from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { ViewportNodes } from './ViewportNode.js';
import { FramebufferTexture, LinearMipmapLinearFilter, Vector2 } from '../../Three.js';
import { NodeFrame } from '../core/NodeFrame.js';
import { UVNode } from '../accessors/UVNode.js';
import { Node } from '../core/Node.js';

const _size = new Vector2();

export class ViewportTextureNode extends TextureNode {
  generateMipmaps: boolean;
  isOutputTextureNode: boolean;

  constructor(
    uvNode: UVNode = ViewportNodes.topLeft,
    levelNode: Node | null = null,
    framebufferTexture: FramebufferTexture | null = null,
  ) {
    if (framebufferTexture === null) {
      framebufferTexture = new FramebufferTexture(0, 0);
      framebufferTexture.minFilter = LinearMipmapLinearFilter;
    }

    super(framebufferTexture, uvNode, levelNode);

    this.generateMipmaps = false;

    this.isOutputTextureNode = true;

    this.updateBeforeType = NodeUpdateType.Frame;
  }

  updateBefore(frame: NodeFrame) {
    const renderer = frame.renderer;
    renderer!.getDrawingBufferSize(_size);

    const framebufferTexture = this.value;
    if (framebufferTexture.image.width !== _size.width || framebufferTexture.image.height !== _size.height) {
      framebufferTexture.image.width = _size.width;
      framebufferTexture.image.height = _size.height;
      framebufferTexture.needsUpdate = true;
    }

    const currentGenerateMipmaps = framebufferTexture.generateMipmaps;
    framebufferTexture.generateMipmaps = this.generateMipmaps;

    renderer!.copyFramebufferToTexture(framebufferTexture);

    framebufferTexture.generateMipmaps = currentGenerateMipmaps;
  }

  clone() {
    //@ts-expect-error
    return new this.constructor(this.uvNode, this.levelNode, this.value);
  }
}

export default ViewportTextureNode;

export const viewportTexture = nodeProxy(ViewportTextureNode);
export const viewportMipTexture = nodeProxy(ViewportTextureNode, null, null, { generateMipmaps: true });

addNodeElement('viewportTexture', viewportTexture);
addNodeElement('viewportMipTexture', viewportMipTexture);
